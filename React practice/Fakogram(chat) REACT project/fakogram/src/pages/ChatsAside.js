import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { actionFullChatList, actionChatsCount } from "../actions";
import { backURL } from "../constants";
import { Link } from "react-router-dom";
import { AvatarStub } from "../components/AvatarStub";

const ChatsAside = ({ chats = [], auth, ownerChats }) => {
    const [chatBlock, setChatBlock] = useState(0);

    useEffect(() => {
        const userId = auth.payload?.sub?.id;
        if (userId) {
            ownerChats(userId);
        }

        return function cleanUp() {};
    }, [chatBlock]);


    return (
        <>
            <div className="chatsContainer" key={Math.random}>
                <div>
                {chats.map((chat, _id) => (
                    <>
                        <Link
                            className="chatsList"
                            to={`/main/${chat._id}`}
                            key={Math.random}
                        >
                            <div className="chatsCard" key={Math.random()}>
                                {chat.avatar?.url ? (
                                    <img
                                        key={Math.random()}
                                        className="smallForChat"
                                        src={backURL + chat.avatar?.url}
                                    />
                                ) : (
                                    <AvatarStub
                                        login={
                                            chat.title !== null
                                                ? chat.title
                                                : "chat without title"
                                        }
                                        key={Math.random()}
                                    />
                                )}
                                <div className="chatLi" key={Math.random()}>
                                    <h5
                                        className="chatTitle"
                                        key={Math.random()}
                                    >
                                        {chat.title !== null
                                            ? chat.title
                                            : "chat without title"}
                                    </h5>
                                    <p key={Math.random()}>
                                        {chat.lastMessage?.text.length >
                                        parseInt("30")
                                            ? chat.lastMessage?.text.substr(
                                                  0,
                                                  30
                                              ) + "..."
                                            : chat.lastMessage?.text.substr(
                                                  0,
                                                  30
                                              )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </>
                ))}
                <Link className="newChatButton" to="/newchat" key={Math.random}>
                    +
                </Link>
                </div>
            </div>
        </>
    );
};

export const CChatsAside = connect(
    (state) => ({
        auth: state.auth,
        chats: Object.values(state.chats).filter((el) => el._id),
    }),
    { ownerChats: actionFullChatList }
)(ChatsAside);
