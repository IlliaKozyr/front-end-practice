import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useDropzone } from "react-dropzone";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";

import { actionFindUsers } from "../actions";
import { CSearchAvatar } from "../components/Avatar";
import { actionSetChatInfo } from "../actions";
import { CChatAvatar } from "../components/Avatar";
import { backURL } from "../constants";
import { color } from "../components/AvatarStub";

const ChatEditing = ({
    chatId,
    onChat,
    myProfile,
    create,
    onLeave,
    onGetUser,
    foundUsers,
}) => {
    const useDebounce = (cb, depArray, delay, onAdd) => {
        let timeoutRef = useRef();
        useEffect(() => {
            clearInterval(timeoutRef.current);
            timeoutRef.current === undefined
                ? (timeoutRef.current = -1)
                : (timeoutRef.current = setTimeout(cb, delay));
        }, depArray);
    };

    const [login, setLogin] = useState();
    useDebounce(() => onGetUser(login), [login], 2000);

    let { _id } = useParams();

    const [chat] = useState();
    const [img, setImg] = useState(null);
    const [newTitle, setNewTitle] = useState(chatId[_id]?.title || "");

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "image/*",
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setImg(acceptedFiles[0]);
        },
    });

    const [members, setMembers] = useState(chatId[_id].members || [myProfile]);

    console.log(members)

    function prepareMembers(members) {
        const newMembers = [];

        for (const member of members) {
            if (create) {
                if (member._id !== myProfile?._id) {
                    newMembers.push({ _id: member._id });
                }
            } else {
                newMembers.push({ _id: member._id });
            }
        }

        return newMembers;
    }

    const onAddMember = (newMember) => {
        setMembers(prepareMembers([...members, newMember]));
    };

    const onDelMember = (i) => {
        setMembers(
            members.filter((el, index) => members[index]._id !== members[i]._id)
        );
    };

    return (
        <div className="newChatContainer">
            <div className="dfb">
                <div>
                    <div {...getRootProps({ className: "dropZoneStyle" })}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="dropZoneStyleBr">
                                Drop the files here ...
                            </p>
                        ) : (
                            <CChatAvatar
                                _id={_id}
                                text="upload chat avatar"
                                className="profileStyle"
                            />
                        )}
                    </div>
                    <div className="profileContainer">
                        <div className="loginNickSetting">
                            <div className="inputContainer">
                                <label for="loginInput">
                                    Enter the new name of the chat:{" "}
                                </label>
                                <input
                                    className="form-control-editing form-control"
                                    id="loginInput"
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => {
                                        setNewTitle(e.target.value);
                                    }}
                                />
                            </div>

                            <div className="inputContainer">
                                {/* <CSearchByLogin onChange={newUserId}/> */}
                                <form>
                                    <label for="loginInput">
                                        Add users to a group:{" "}
                                    </label>
                                    <div className="search-box">
                                        <input
                                            className="form-control-editing form-control"
                                            placeholder=""
                                            value={login}
                                            onChange={(e) =>
                                                setLogin(e.target.value)
                                            }
                                        />
                                    </div>
                                    {foundUsers
                                        ? foundUsers.map((user, i) => {
                                              return (
                                                  <div className="searchBlock">
                                                      {user?.avatar !== null ? (
                                                          <CSearchAvatar
                                                              avatarUrl={user}
                                                          />
                                                      ) : (
                                                          <div className="avatarStubChat2"></div>
                                                      )}

                                                      <div>
                                                          {user?.login
                                                              ? user.login
                                                              : "anon"}
                                                      </div>

                                                      <div>
                                                          <Button
                                                            id={user._id + i}
                                                              user={user?.login}
                                                              onClick={() => {
                                                                  onAddMember(
                                                                      user
                                                                  );
                                                                      (document.getElementById(
                                                                          user._id + i
                                                                      ).innerHTML =
                                                                          "✓");
                                                              }}
                                                          >
                                                              +
                                                          </Button>
                                                      </div>
                                                  </div>
                                              );
                                          })
                                        : null}
                                </form>
                            </div>

                            <div className="df">
                                <div className="df"></div>
                                <Button
                                    variant="primary"
                                    className="buttonSetting"
                                    onClick={() => {
                                        onChat(
                                            "media",
                                            img,
                                            newTitle,
                                            prepareMembers(members),
                                            _id
                                        );
                                    }}
                                >
                                    <Link
                                        to="/changesdonechats"
                                        style={{
                                            color: "white",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Apply Changes
                                    </Link>
                                </Button>
                                

                                <Link
                                    to={"/main/" + _id}
                                    className="changepasLink"
                                >
                                    Back to chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        {chatId[_id]?.members.map((login, i) => {
                            return (
                                <>
                                    <div className="membersBlock">
                                        {login?.avatar !== null ? (
                                            <CSearchAvatar avatarUrl={login} />
                                        ) : (
                                            <div className="avatarStubChat2"></div>
                                        )}

                                        <div>
                                            {login?.login
                                                ? login.login
                                                : "anon"}
                                        </div>

                                        <div>
                                            <Button
                                                id={login._id}
                                                user={login?.login}
                                                onClick={() => {
                                                    onDelMember(i);
                                                    document.getElementById(
                                                        login._id
                                                    ).innerHTML = "✓";
                                                }}
                                                key={i}
                                            >
                                                x
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            );
                        })}
                    </div>
                    <p className="p">
                        *Click on "x" and don't forget to click "Apply Changes"
                    </p>
                </div>
            </div>
        </div>
    );
};

export const CChatEditing = connect(
    (state) => ({
        myProfile: state.promise.myProfile?.payload || {},
        chatId: state.chats,
        foundUsers: state?.promise?.findUsers?.payload,
    }),
    {
        onChat: actionSetChatInfo,
        
        onGetUser: actionFindUsers,
    }
)(ChatEditing);
