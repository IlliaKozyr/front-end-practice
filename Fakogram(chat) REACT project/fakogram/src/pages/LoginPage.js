import React from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useState } from "react";
import { store } from "../reducers/index";
import { actionFullLogin } from "../actions";
import { Link } from "react-router-dom";
import { connect } from "react-redux";



const Login = ({ onLogin, loginCheck }) => {

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    if(loginCheck.token === {}) {
        alert('error')
    }

    return (
        <div className="formContainerLogin">
            <h1 className="textLogin">Login</h1>
            <FloatingLabel
                controlId="floatingInput"
                label="Enter Login"
                className="mb-3"
                onChange={(e) => {
                    setLogin(e.target.value);
                }}
            >
                <Form.Control
                    type="text"
                    placeholder="text"
                    className="form-control-editing"
                />
            </FloatingLabel>
            <FloatingLabel
                controlId="floatingPassword"
                label="Enter Password"
                onChange={(e) => {
                    setPassword(e.target.value);
                }}
            >
                <Form.Control
                    type="password"
                    placeholder="Password"
                    className="form-control-editing"
                />
            </FloatingLabel>

            <div className="d-flex loginForm">
                <Button
                    variant="primary"
                    type="submit"
                    className="btn-setting"
                    onClick={() => {
                        onLogin(login, password);
                    }}
                    disabled={!login || !password}
                >
                    <b>Login</b>
                </Button>
                
                <Link to="/registration" className="registerLink alert-link">
                    Don't have an account? Register
                </Link>
            </div>
        </div>
    );
};

export const CLogin = connect((state) => ({loginCheck: state.auth}), { onLogin: actionFullLogin })(Login);
