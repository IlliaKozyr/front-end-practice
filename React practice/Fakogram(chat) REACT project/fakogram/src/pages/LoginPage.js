import React from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useState, useEffect } from "react";
import { store } from "../reducers/index";
import { actionFullLogin } from "../actions";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { compose } from "redux";
import { history } from "../App";

const Login = ({ onLogin, token }) => {
    
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [check, setCheck] = useState(false)

    // useEffect(() => {
    //     if(token?.token) {

    //     }
    // }, [token])
    
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
                        setTimeout(() => setCheck(true), 1500)

                    }}
                    disabled={!login || !password}
                >
                    <b>Login</b>
                </Button>

                <div className={check ? "logErrorOn" : 'logErrorOff'}>
                    <h5>Incorect Login or Password</h5>
                </div>

                <Link to="/registration" className="registerLink alert-link">
                    Don't have an account? Register
                </Link>
            </div>
        </div>
    );
};

export const CLogin = connect((state) => ({token: state.auth}), {
    onLogin: actionFullLogin,
})(Login);
