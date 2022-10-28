import { history } from "../App";
import {
    actionAboutMe,
    actionMsgOne,
    actionMsgList,
    actionChatOne,
    actionChatLeft,
} from "../reducers";

import { actionGetMsgsByChat, actionGetMsgById, actionGetChatById } from ".";



// данные из сокета приходят не полные,
// поэтому потом приходится затягивать доп данные из графа

export const actionOnMsg = (msg) => async (dispatch, getState) => {
    const state = getState();
    const myId = state.auth.payload?.sub?.id;
    const ownerId = msg.owner?._id;

    const chatId = msg.chat?._id;

    await dispatch(actionMsgOne(msg));

    const msgFull = await dispatch(actionGetMsgById(msg._id));
    await dispatch(actionMsgOne(msgFull));

    const chatUpdated = await dispatch(actionGetChatById(chatId));
    await dispatch(actionChatOne(chatUpdated));
};

export const actionOnChat = (chat) => async (dispatch, getState) => {
    const state = getState();
    const myId = state.auth.payload?.sub?.id;
    // приходится делать так, так как овнер не приходит по сокету
    const ownerId = state.chats[chat._id]?.owner?._id;

    dispatch(actionChatOne(chat));

    const chatFull = await dispatch(actionGetChatById(chat._id));
    await dispatch(actionChatOne(chatFull));

    const chatMsgs = await dispatch(actionGetMsgsByChat(chat._id));
    await dispatch(actionMsgList(chatMsgs));

    await dispatch(actionAboutMe());
};

export const actionOnChatLeft = (chat) => async (dispatch, getState) => {
    const state = getState();
    const myId = state.auth.payload?.sub?.id;
    const ownerId = state.chats[chat._id]?.owner?._id;

    // если чат чужой, то удаляем его и апдейтим роутер
    // если мой, то просто обновляем статус чата
    if (myId !== ownerId) {
        dispatch(actionChatLeft(chat));
        const [, , histId] = history.location.pathname.split("/");
        if (histId === chat._id) {
            history.push("/");
        }
    } else {
        dispatch(actionChatOne(chat));
        const chatFull = await dispatch(actionGetChatById(chat._id));
        await dispatch(actionChatOne(chatFull));
    }

    await dispatch(actionAboutMe());
};
