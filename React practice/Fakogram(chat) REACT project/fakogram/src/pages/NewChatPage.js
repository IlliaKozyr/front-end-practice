import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { CSearchAvatar } from "../components/Avatar";
import { actionSetChatInfo } from "../actions";
import { actionFindUsers } from "../actions";
import { history } from "../App";
import { backURL } from "../constants";
import { CChatAvatar } from "../components/Avatar";

const ChatPage = ({
    onChat,
    chat,
    myProfile,
    create,
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

    const [open, setOpen] = useState(false);
    const [img, setImg] = useState([]);
    const [title, setTitle] = useState(chat?.title || "");
    const [members, setMembers] = useState(chat?.members || [myProfile]);

    console.log(img)

    function checkMembers(members, user) {
        for (var i = 0; i < members.length; i++) {
            if (members[i]?._id === user?._id) {
                return false;
            }
        }
        return onAddMember(user);
    }

    const onAddMember = (newMember) => {
        setMembers([...members, newMember]);
    };

    const onDelMember = (i) => {
        setMembers(
            members.filter((el, index) => members[index]._id !== members[i]._id)
        );
    };

    useEffect(() => {
        setTitle(chat?.title || "");
        setImg(null);
        setMembers(chat?.members || [myProfile]);
    }, [open]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "image/*",
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setImg(acceptedFiles[0]);
        },
    });

    function prepareMembers(members) {
        const newMembers = [];

        for (const member of members) {
            if (checkMembers(newMembers, member)) {
                if (member._id !== myProfile?._id) {
                    newMembers.push({ _id: member._id });
                }
            } else {
                newMembers.push({ _id: member._id });
            }
        }

        newMembers.shift();
        return newMembers;
    }

    return (
        <div className="newChatContainer">
            <div className="dfb">
                <div className="newChatContainer">
                    <div {...getRootProps({ className: "dropZoneStyle" })}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="dropZoneStyleBr">
                                Drop the files here ...
                            </p>
                        ) : (
                            <CChatAvatar
                                text="upload chat avatar"
                                className="profileStyle"
                            />
                        )}
                    </div>
                    <div className="profileContainer">
                        <div className="loginNickSetting">
                            <div className="inputContainer">
                                <label for="loginInput">
                                    Enter the name of the chat:{" "}
                                </label>
                                <input
                                    className="form-control-editing form-control"
                                    id="loginInput"
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                    }}
                                />
                            </div>

                            <div className="inputContainer">
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
                                                                  checkMembers(
                                                                      members,
                                                                      user
                                                                  );
                                                                  document.getElementById(
                                                                      user._id +
                                                                          i
                                                                  ).innerHTML =
                                                                      "✓";
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
                                <Button
                                    variant="primary"
                                    className="buttonSetting"
                                    onClick={() => {
                                        onChat(
                                            "media",
                                            img,
                                            title,
                                            prepareMembers(members),
                                            chat?.id
                                        );
                                        history.push("/main");
                                    }}
                                >
                                    <Link
                                        // to="/changesdonechats"
                                        style={{
                                            color: "white",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Apply Changes
                                    </Link>
                                </Button>

                                <Link to="/main" className="changepasLink">
                                    Back to all chats
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        {members.map((login, i) => {
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
                </div>
            </div>
        </div>
    );
};

export const CNewChatPage = connect(
    (state) => ({
        myProfile: state.promise.myProfile?.payload || {},
        foundUsers: state?.promise?.findUsers?.payload,
    }),
    { onChat: actionSetChatInfo, onGetUser: actionFindUsers }
)(ChatPage);
