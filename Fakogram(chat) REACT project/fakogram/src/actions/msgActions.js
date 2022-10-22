import { gql } from '../helpers'
import {
    actionPromise,
    actionMsgList,
    actionMsgOne,
    actionChatOne,
    store,
} from '../reducers'
import { actionUploadFile } from './mediaActions'

export const actionGetMsgsByChat = (chatId, skipCount = 0, limitCount = 50) =>
    actionPromise(
        'chatMsgs',
        gql(
            `query chatMsgs($q: String) {
      MessageFind (query: $q){
         _id
         createdAt
         owner {
            _id
            login
            nick
            avatar {
               url
            }
         }
         text
         chat {
            _id
         }
         media {
            _id
            url
            type
            originalFileName            
         }

         forwardWith {
            _id
         }
         replies {
            _id
         }

         replyTo {
            _id
         }
         forwarded {
            _id
         }
         
      }     
   }`,
            {
                q: JSON.stringify([
                    { 'chat._id': { $in: [chatId] } },
                    {
                        sort: [{ _id: -1 }],
                        skip: [skipCount],
                        limit: [limitCount],
                    },
                ]),
            }
        )
    )

export const actionFullMsgsByChat =
    (chatId, currentCount, limitCount = 50) =>
    async (dispatch, getState) => {
        const chat = getState().chats[chatId]

        if (
            !chat ||
            !chat.messages ||
            (chat.messages[0]?._id !== chat.firstMsgId &&
                (chat.messages?.length ?? 0) < currentCount + limitCount)
        ) {

            const payload = await dispatch(
                actionGetMsgsByChat(chatId, currentCount, limitCount)
            )
            if (payload) {
                await dispatch(actionMsgList(payload))
            }
        }
    }

const actionFirstMsgByChat = (chatId) =>
    actionPromise(
        'firstMsg',
        gql(
            `query firstMsg($q: String) {
      MessageFind (query: $q){
         _id
      }     
   }`,
            {
                q: JSON.stringify([
                    { 'chat._id': chatId },
                    {
                        sort: [{ _id: 1 }],
                        skip: [0],
                        limit: [1],
                    },
                ]),
            }
        )
    )

export const actionGetAllLastMsg = (chats) => async (dispatch, getState) => {
    const msgReq = chats.map((chat) =>
        Promise.all([
            dispatch(actionGetMsgsByChat(chat._id, 0, 1)),

            getState().chats[chat._id]?.firstMsgId
                ? Promise.resolve([])
                : dispatch(actionFirstMsgByChat(chat._id)),
        ])
    )

    for await (const [lastMsgs, firstMsgs] of msgReq) {
        lastMsgs.length && dispatch(actionMsgOne(lastMsgs[0]))
        firstMsgs.length &&
            dispatch(
                actionChatOne({
                    _id: lastMsgs[0].chat._id,
                    firstMsgId: firstMsgs[0]._id,
                })
            )
    }
}

export const actionMsgsCount = (chatId) =>
    actionPromise(
        'msgsCount',
        gql(
            `query msgsCount($q: String) {
      MessageCount (query: $q)  
   }`,
            {
                q: JSON.stringify([{ 'chat._id': chatId }]),
            }
        )
    )

export const actionGetMsgById = (msgId) =>
    actionPromise(
        'msgById',
        gql(
            `query msgById($q: String) {
      MessageFindOne (query: $q){
         _id
         createdAt
         owner {
            _id
            login
            nick
            avatar {
               url
            }
         }
         text
         chat {
            _id
         }
         media {
            _id
            url
            type
            originalFileName            
         }

         forwardWith {
            _id
         }
         replies {
            _id
         }

         replyTo {
            _id
         }
         forwarded {
            _id
         }
      }     
   }`,
            {
                q: JSON.stringify([{ _id: msgId }]),
            }
        )
    )

export const actionUpdateMsg = (chatId, text, media, msgId) =>
    actionPromise(
        'updateMsg',
        gql(
            `mutation updateMsg($msg: MessageInput) {
      MessageUpsert(message: $msg) {
         _id
         createdAt
         owner {
            _id
            login
            nick
            avatar {
               url
            }
         }
         text
         chat {
            _id
         }
         media {
            _id
            url
            type
            originalFileName            
         }


         forwardWith {
            _id
         }
         replies {
            _id
         }

         replyTo {
            _id
         }
         forwarded {
            _id
         }
      }
   }`,
            {
                msg: {
                    _id: msgId,
                    text,
                    chat: { _id: chatId },
                    media,
                    // replyTo: {_id: undefined}
                },
            }
        )
    )

// медиа - массив объектов с ид медиа
export const actionSendMsg =
    (chatId, text, inputName, files, msgId) => async (dispatch) => {
        // тут нужно отделить уже залитые файлы от тех которые лежат локально
        // локальные залить и получить ид, с залитых просто получить ид
        const mediaToUpload = []
        const media = []
        for (const file of files) {
            if (file.url.match(/blob/)) {
                mediaToUpload.push(dispatch(actionUploadFile(inputName, file)))
            } else {
                let fileObj = file
                media.push({ _id: fileObj?._id })
            }
        }

        const fileArr = await Promise.all(mediaToUpload)
        if (fileArr) {
            for (const uploadedFile of fileArr) {
                media.push({ _id: uploadedFile?._id })
            }
        }

        const payload = await dispatch(
            actionUpdateMsg(chatId, text, media, msgId)
        ) 
    }



