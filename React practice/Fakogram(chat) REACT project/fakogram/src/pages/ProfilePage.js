import React, { useCallback, useState, useEffect } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import { CMyAvatar } from "../components/Avatar";
import { actionSetUserInfo } from "../actions";
import { connect } from "react-redux";

const ProfilePage = ({ myProfile, onChanges }) => {
    const [login, setLogin] = useState(myProfile.login);
    const [nick, setNick] = useState(myProfile.nick);
    const [img, setImg] = useState(null);

    console.log(img)

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "image/*",
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            setImg(acceptedFiles[0]);
        },
        
    });

    return (
        <div style={{ paddingTop: "100px" }}>
            <h1 className="textProfile">My profile</h1>
            <div {...getRootProps({ className: "dropZoneStyle" })}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="dropZoneStyleBr">Drop the files here ...</p>
                ) : (
                    <CMyAvatar text="change avatar" className="profileStyle"/>
                )}
            </div>
            <div className="profileContainer">
                <div className="loginNickSetting">
                    <div className="inputContainer">
                        <label>Enter a new Login: </label>
                        <input
                            className="form-control-editing form-control"
                            id="loginInput"
                            type="text"
                            value={login}
                            onChange={(e) => {
                                setLogin(e.target.value);
                            }}
                        />
                    </div>

                    <div className="inputContainer">
                        <label>Enter a new Nick: </label>
                        <input
                            className="form-control-editing form-control"
                            id="nickInput"
                            type="text"
                            value={nick}
                            onChange={(e) => {
                                setNick(e.target.value);
                            }}
                        />
                    </div>

                    <div className="df">
                        <Button
                            variant="primary"
                            className="buttonSetting"
                            onClick={() => {
                                onChanges("media", img, login, nick);
                                console.log("media", login, nick, img);
                            }}
                        >
                            <Link
                                to="/changesdone"
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                }}
                            >
                                Apply Changes
                            </Link>
                        </Button>

                        <Link to="/changepas" className="changepasLink">
                            Сhange password
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CProfilePage = connect(
    (state) => ({
        myProfile: state.promise?.myProfile?.payload || {},
    }),
    { onChanges: actionSetUserInfo }
)(ProfilePage);
