import { history } from "../App";
import { gql } from "../helpers";
import {
    actionPromise,
    actionChatList,
    actionChatOne,
    actionChatLeft,
    actionAboutMe,
    store,
} from "../reducers";
import { actionGetAllLastMsg } from "./msgActions";
import { actionUploadFile } from "./mediaActions";

// в массив newMemders передавать объекты только с полем _id
const actionUpdateChat = (title, members, chatId) =>
    actionPromise(
        "updateChat",
        gql(
            `mutation updateChat($chat:ChatInput) {
      ChatUpsert(chat:$chat) {
         _id
         title
         avatar {
            _id
            url
         }
         owner {
            _id
            login
            avatar {
               _id
               url
            }
         }
         members {
            _id
            login
            nick
            avatar {
               _id
               url
            }
         }
         lastModified    
      }
   }`,
            { chat: { _id: chatId, title, members } }
        )
    );

// MediaUpsert нужен только для добавления данных для загруженного файла
// и дальнейшего отображения его через эти данные (через аватары, сообщения)
const actionUpdateChatAvatar = (mediaId, chatId) =>
    actionPromise(
        "uploadFile",
        gql(
            `mutation uploadFile($media: MediaInput) {  
        MediaUpsert(media: $media) {
            _id
            url   
        }
    }`,
            { media: { _id: mediaId, chatAvatars: { _id: chatId } } }
        )
    );

export const actionSetChatInfo =
    (name, file, title, members, chatId) => async (dispatch) => {
        const chat = await dispatch(actionUpdateChat(title, members, chatId));

        if (file && chat._id) {
            const fileObj = await dispatch(actionUploadFile(name, file));
            const chatAvatar = await dispatch(
                actionUpdateChatAvatar(fileObj?._id, chat._id)
            );
            await dispatch(
                actionChatOne({ _id: chat._id, avatar: chatAvatar })
            );
        }
    };

// поиск по значению в массиве объектов - { 'members._id': userId }
export const actionGetChatsByUser = (userId, skipCount = 0, limitCount = 50) =>
    actionPromise(
        "userChats",
        gql(
            `query userChats($q: String) {
      ChatFind (query: $q){
         _id
         title
         avatar {
            _id
            url
         } 
         owner {
            _id
            login
            avatar {
               _id
               url
            }
        }
         members {
            _id
            login
            nick
            avatar {
               _id
               url
            }
         }
         lastModified
         lastMessage {
            _id text
          }
      }     
   }`,
            {
                q: JSON.stringify([
                    {
                        $or: [{ ___owner: userId }, { "members._id": userId }],
                    },
                    {
                        sort: [{ lastModified: -1 }],
                        skip: [skipCount],
                        limit: [limitCount],
                    },
                ]),
            }
        )
    );

export const actionFullChatList =
    (userId, currentCount, limitCount = 50) =>
    async (dispatch) => {
        const payload = await dispatch(
            actionGetChatsByUser(userId, currentCount, limitCount)
        );
        if (payload) {
            await dispatch(actionChatList(payload));

            await dispatch(actionGetAllLastMsg(payload));
        }
    };

export const actionGetChatById = (chatId) =>
    actionPromise(
        "chatById",
        gql(
            `query chatById($q: String) {
      ChatFindOne (query: $q){
         _id
         title
         avatar {
            _id
            url
         }
         owner {
            _id
            login
            avatar {
               _id
               url
            }
         }

         members {
            _id
            login
            nick
            avatar {
               _id
               url
            }
         }
         lastModified
         messages {
          _id text
        }
      }     
   }`,
            {
                q: JSON.stringify([{ _id: chatId }]),
            }
        )
    );

export const actionChatsCount = (userId) =>
    actionPromise(
        "chatsCount",
        gql(
            `query chatsCount($q: String) {
      ChatCount (query: $q)  
   }`,
            {
                q: JSON.stringify([{ ___owner: userId }]),
            }
        )
    );

// происходит когда юзер уходит сам, иначе в чат добавляются юзер, а не наоборот
const actionUpdateUserChats = (userId, newChats) =>
    actionPromise(
        "updateUserChats",
        gql(
            `mutation updateUserChats($user:UserInput) {
      UserUpsert(user:$user) {
         _id   
         login  
         nick
         chats {
            title
            _id
         }
      }
   }`,
            { user: { _id: userId, chats: newChats } }
        )
    );

   