import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { actionFullMsgsByChat } from "../actions";
import { store } from "../reducers";
import Button from "react-bootstrap/esm/Button";
import { backURL } from "../constants";
import { AvatarStubHeader } from "../components/AvatarStub";
import { actionSendMsg } from "../actions";
import { useDropzone } from "react-dropzone";

const ChatMsgs = ({
    chatMsgs = [],
    getChat,
    msgsCount = 20,
    sendMsg,
    msg,
    nickOwner,
}) => {
    const [files, setFiles] = useState(
        msg?.media.map((mediaFile) => ({
            ...mediaFile,
            url: backURL + mediaFile.url,
        })) || []
    );

    const { getRootProps, getInputProps } = useDropzone({
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            await setFiles([
                ...files,
                ...acceptedFiles.map((file) =>
                    Object.assign(file, {
                        url: URL.createObjectURL(file),
                    })
                ),
            ]);
        },
    });
    const [msgsBlock, setMsgsBlock] = useState(0);

    console.log(files, "FILES");

    let { _id } = useParams();

    useEffect(() => setFiles([]) , [getChat[_id]])

    useEffect(() => {
        chatMsgs(_id, msgsBlock, msgsCount);
    }, [_id]);

    const onDelFiles = (i) => {
        setFiles(
            files.filter((el, index) => files[index].lastModified !== files[i].lastModified)
        );
    };

    const [text, setText] = useState("");
    const [msgs] = useState(getChat);

    const oneChatMsgs = getChat[_id]?.messages;
    return (
        <>
            <div className="chatBlock">
                <Link to={"/chatediting/" + getChat[_id]?._id}>
                    <div className="displayFixed">
                        {getChat[_id]?.avatar?.url ? (
                            <img
                                className="forChatHeader"
                                src={backURL + getChat[_id]?.avatar?.url}
                            />
                        ) : (
                            <AvatarStubHeader
                                login={
                                    getChat[_id]?.title !== null
                                        ? getChat[_id]?.title
                                        : "chat without title"
                                }
                            />
                        )}
                        <h5>{getChat[_id]?.title}</h5>
                        <h6>Members: {getChat[_id]?.members.length}</h6>
                    </div>
                </Link>

                <div className="chatContainer">
                    <ul className="msgsContainer">
                        {oneChatMsgs === undefined ? (
                            <h2 className="noMsg">No messages</h2>
                        ) : (
                            oneChatMsgs.map((msg) => (
                                <div
                                    className={
                                        msg?.owner?.nick === nickOwner
                                            ? "msgLi"
                                            : "msgOther"
                                    }
                                    key={Math.random()}
                                >
                                    <div className="msgBlock">
                                        {msg?.owner?.avatar?.url ===
                                        undefined ? (
                                            <div
                                                className="avatarStubChat1"
                                                key={Math.random()}
                                            ></div>
                                        ) : (
                                            <img
                                                src={
                                                    backURL +
                                                    msg?.owner.avatar?.url
                                                }
                                                className="smallForChat1"
                                                key={Math.random()}
                                            />
                                        )}

                                        <h5
                                            style={{ paddingTop: "5px" }}
                                            key={Math.random()}
                                        >
                                            {msg?.owner?.nick === null
                                                ? msg?.owner?.login
                                                : msg?.owner?.nick}
                                        </h5>
                                    </div>
                                    {msg?.media?.map((oneMsg) => (
                                        <img
                                            className="msgMedia"
                                            src={backURL + oneMsg.url}
                                            key={Math.random()}
                                        />
                                    ))}
                                    <li key={Math.random}>{msg?.text}</li>
                                </div>
                            ))
                        )}
                    </ul>
                </div>

                <div>
                    {oneChatMsgs === getChat[_id] ? (
                        <></>
                    ) : (
                        <div>
                            <div className="preloaderContainer">
                                {files.map((file, i) => (
                                    <div className="preloaderBlock">
                                        <img src={file?.url} className="preload" key={file.lastModified}/>
                                        <button onClick={() => onDelFiles(i)} key={i}>
                                            x
                                        </button>
                                    </div>
                                    
                                    
                                ))}  
                            </div>

                            <div className="sendMsgBlock">
                                <div className="sendBlock">
                                    <div
                                        {...getRootProps({
                                            className: "dropZoneStyle2",
                                        })}
                                    >
                                        <input {...getInputProps()} />

                                        <img
                                            src="https://img.icons8.com/ios-filled/344/folder-invoices--v2.png"
                                            className="sandFile"
                                        />
                                    </div>
                                    <textarea
                                        name="inputName"
                                        placeholder="Write a message..."
                                        rows="2"
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                        }}
                                    />
                                </div>

                                <Button
                                    onClick={() => {
                                        sendMsg(
                                            getChat[_id]?._id,
                                            text,
                                            "media",
                                            files
                                        );
                                        setText("");
                                        setFiles([]);
                                    }}
                                >
                                    Send a message
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export const CChatMsgs = connect(
    (state) => ({
        getChat: state.chats,
        nickOwner: store.getState().promise.myProfile.payload?.nick,
    }),
    {
        chatMsgs: actionFullMsgsByChat,
        sendMsg: actionSendMsg,
    }
)(ChatMsgs);
