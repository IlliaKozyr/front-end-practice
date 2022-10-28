import React, { useEffect } from "react";
import { gql } from "../helpers";
import { actionChatsCount } from "../actions";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
    actionOnMsg,
    actionOnChat,
    actionOnChatLeft,
    actionFullLogout,
    actionFullMsgsByChat
} from "../actions";
import io from "socket.io-client";
import { actionFindUsers } from "../actions";

export function promiseReducer(state, { type, status, payload, error, name }) {
    if (!state) {
        return {};
    }
    if (type === "PROMISE") {
        return {
            ...state,
            [name]: {
                status: status,
                payload:
                    (status === "PENDING" &&
                        state[name] &&
                        state[name].payload) ||
                    payload,
                error: error,
            },
        };
        //для пользы при работе с промисами надо бы пока PENDING не делать payload undefined
        //при наличии старого payload
    }
    return state;
}

const actionPending = (name) => ({ type: "PROMISE", status: "PENDING", name });
const actionResolved = (name, payload) => ({
    type: "PROMISE",
    status: "RESOLVED",
    name,
    payload,
});
const actionRejected = (name, error) => ({
    type: "PROMISE",
    status: "REJECTED",
    name,
    error,
});

export const actionPromise = (name, promise) => async (dispatch) => {
    dispatch(actionPending(name));
    try {
        let data = await promise;
        dispatch(actionResolved(name, data));
        return data;
    } catch (error) {
        dispatch(actionRejected(name, error));
    }
};

// ------------------

function jwtDecode(token) {
    try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        return decoded;
    } catch (err) {
        console.log(err);
    }
}

export function authReducer(state, { type, token }) {
    if (!state) {
        if (localStorage.authToken) {
            token = localStorage.authToken;
            type = "AUTH_LOGIN";
        } else {
            return {};
        }
    }
    if (type === "AUTH_LOGIN") {
        const payload = jwtDecode(token);
        if (typeof payload === "object") {
            localStorage.authToken = token;
            return {
                ...state,
                token,
                payload,
            };
        } else {
            console.error(
                "Токен " + localStorage.authToken + " неверный и был удален"
            );
            delete localStorage.authToken;
            return state || {};
        }
    }
    if (type === "AUTH_LOGOUT") {
        delete localStorage.authToken;
        return {};
    }
    return state;
}

export const actionAuthLogin = (token) => ({ type: "AUTH_LOGIN", token });
export const actionAuthLogout = () => ({ type: "AUTH_LOGOUT" });

// -----------------------------------

export function chatsReducer(state, { type, payload }) {
    if (!state) {
        return {};
    }
    function refreshMsgs(newMsgs, oldMsgs) {
        const msgState = [...oldMsgs];

        for (const newMsg of newMsgs || []) {
            const currIndex = msgState.findIndex(
                (oldMsg) => oldMsg._id === newMsg._id
            );

            if (currIndex === -1) {
                msgState.push(newMsg);
            } else {
                msgState[currIndex] = newMsg;
            }
        }
        const newMsgState = msgState.sort((a, b) => {
            if (a._id > b._id) {
                return 1;
            }
            if (a._id < b._id) {
                return -1;
            }
            return 0;
        });

        return newMsgState;
    }

    function getInfoAboutNext(msgState) {
        const informedState = [];

        for (let i = 0; i < msgState.length; i++) {
            const msg = msgState[i];

            msg.nextMsg = msgState[i + 1] || null;
            informedState.push(msg);
        }

        return informedState;
    }

    function sortChats(unsortedChats) {
        return Object.fromEntries(
            Object.entries(unsortedChats).sort((a, b) => {
                if (a[1].lastModified > b[1].lastModified) {
                    return -1;
                }
                if (a[1].lastModified < b[1].lastModified) {
                    return 1;
                }
                return 0;
            })
        );
    }

    const types = {
        CHATS() {
            if (payload) {
                const oldChats = { ...state };

                for (const chat of payload) {
                    const oldChat = oldChats[chat._id];

                    if (!oldChat) {
                        oldChats[chat._id] = { ...chat };
                    } else
                        for (const key in chat) {
                            const oldValue = oldChat[key];
                            const newValue = chat[key];

                            if (newValue) {
                                if (key === "messages") {
                                    oldChats[chat._id][key] = getInfoAboutNext(
                                        refreshMsgs(newValue, oldValue)
                                    );
                                } else {
                                    oldChats[chat._id][key] = newValue;
                                }
                            } else {
                                oldChats[chat._id][key] = oldValue;
                            }
                        }
                }

                const newState = sortChats(oldChats);

                return newState;
            }
            return state;
        },

        CHAT_LEFT() {
            const { [payload._id]: removed, ...newState } = state;
            return newState;
        },

        CHATS_CLEAR() {
            return {};
        },

        MSGS() {
            if (payload && payload.length > 0) {
                const chatId = payload[0]?.chat?._id;

                const msgState = state[chatId]?.messages || [];

                const newMsgState = getInfoAboutNext(
                    refreshMsgs(payload, msgState)
                );

                const newState = {
                    ...state,
                    [chatId]: {
                        ...state[chatId],
                        messages: newMsgState,
                    },
                };

                return newState;
            }
            return state;
        },
    };
    if (type in types) {
        return types[type]();
    }
    return state;
}

export const actionChatList = (chats) => ({ type: "CHATS", payload: chats });
export const actionChatOne = (chat) => ({ type: "CHATS", payload: [chat] });
export const actionChatLeft = (chat) => ({ type: "CHAT_LEFT", payload: chat });
export const actionChatsClear = () => ({ type: "CHATS_CLEAR" });

export const actionMsgList = (msgs) => ({ type: "MSGS", payload: msgs });
export const actionMsgOne = (msg) => ({ type: "MSGS", payload: [msg] });

// -------------------------------

export const actionUserFindOne = (userId, name = "findUserOne") =>
    actionPromise(
        name,
        gql(
            `query findUserOne($q: String) {
      UserFindOne (query: $q){
         _id
         createdAt
         login
         nick
         avatar {
            _id
            url
         }
         chats{
            avatar {
                _id
                url
             }
            messages {
                _id
                createdAt
                text
                        owner {
                          _id
                          createdAt
                          login
                          nick
                        }
                media {
                  _id
                  createdAt
                  text
                  url
                  originalFileName
                  type
                }
              }
            _id
            createdAt
            title
            lastMessage {
                _id
                createdAt
                text
            }
        }
    }
}
`,
            {
                q: JSON.stringify([{ _id: userId }]),
            }
        )
    );

export const actionAboutMe = () => async (dispatch, getState) => {
    let { auth } = getState();
    let id = auth?.payload?.sub?.id;
    if (id) {
        await dispatch(actionUserFindOne(id, "myProfile"));
        await dispatch(actionChatsCount(id));
    }
};

// -----------------------

export const store = createStore(
    combineReducers({
        auth: authReducer,
        chats: chatsReducer,
        promise: promiseReducer,
    }),

    applyMiddleware(thunk)
);

store.dispatch(actionAboutMe());

///////////////////////////////////////////////////////////////////

// if (Object.keys(store.getState().auth).length > 0) {}
    
    export const socket = window.io("ws://chat.ed.asmer.org.ua");

    socket.on("jwt_ok", (data) => console.log(data));
    socket.on("jwt_fail", (error) => {
        console.log(error);
        store.dispatch(actionFullLogout());
    });

    socket.on("msg", (msg) => {
        console.log("пришло смс");
        // store.dispatch(actionOnMsg(msg));
        store.dispatch(actionMsgOne(msg));
    });

    socket.on("chat", (chat) => {
        console.log("нас добавили в чат");
        store.dispatch(actionOnChat(chat));

        const state = store.getState();
        // socket.disconnect(true);
        // socket.connect();
        socket.emit("jwt", state.auth.token);
    });

    socket.on("chat_left", (chat) => {
        console.log("нас выкинули из чата");
        store.dispatch(actionOnChatLeft(chat));
    });

   


store.subscribe(() => console.log(store.getState()));
// console.log(store.getState());

const bodyColor = () => {
    return (document.body.style.background = "#eee");
};
bodyColor();

