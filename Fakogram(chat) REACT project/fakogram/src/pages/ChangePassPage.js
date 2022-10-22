import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import { Link } from "react-router-dom";
import { actionSetUserPass } from "../actions";
import { connect } from "react-redux";
import PasswordChecklist from "react-password-checklist";
import { passValidator } from "../helpers/passValidator";

const ChangePass = ({ onPassword, minLength = "5" }) => {
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    return (
        <div className="passwordSetting">
            <h1 className="textProfile">Change password</h1>
            <div className="inputContainer">
                <label for="passwordInput">Enter a new password: </label>
                <input
                    className="form-control-editing form-control"
                    id="passwordInput"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
            </div>

            <div className="inputContainer">
                <label for="passwordAgainInput">
                    Re-enter the new password:
                </label>
                <input
                    className="form-control-editing form-control"
                    id="passwordAgainInput"
                    type="password"
                    value={passwordAgain}
                    onChange={(e) => {
                        setPasswordAgain(e.target.value);
                    }}
                />
            </div>
            <PasswordChecklist
                rules={["minLength", "number", "capital", "match"]}
                className="validator"
                minLength={8}
                value={password}
                valueAgain={passwordAgain}
                onChange={(isValid) => {}}
            />

            <div className="df">
                <Button
                    variant="primary"
                    className="buttonSetting"
                    onClick={() => {
                        onPassword(password);
                        console.log(password, passwordAgain);
                    }}
                    disabled={!passValidator(password, passwordAgain)}
                >
                    <Link
                        to="/changesdone"
                        style={{ color: "white", textDecoration: "none" }}
                    >
                        Apply Changes
                    </Link>
                </Button>

                <Link to="/profile" className="changepasLink">
                    Back to profile
                </Link>
            </div>
        </div>
    );
};

export const CChangePass = connect(null, { onPassword: actionSetUserPass })(
    ChangePass
);
