import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { store, socket } from "./reducers";
import createHistory from "history/createBrowserHistory";
import { Provider, connect } from "react-redux";
import { Router, Route, Switch } from "react-router-dom";
import { CLogin } from "./pages/LoginPage";
import { CRegistration } from "./pages/RegPage";
import Header from "./pages/Header";
import { CProfilePage } from "./pages/ProfilePage";
import { CNewChatPage } from "./pages/NewChatPage";
import { CChangePass } from "./pages/ChangePassPage";
import { ChangesDone } from "./pages/ChangesDonePage";
import { ChangesDoneForChats } from "./pages/ChangeDoneForChat";
import { AboutUs } from "./pages/AboutUs";
import { Redirect } from "react-router-dom";
import { CChatMsgs } from "./pages/ChatMsgsPage";
import { CChatsAside } from "./pages/ChatsAside";
import { Preloader } from "./helpers/preloaders";
import { CChatEditing } from "./pages/ChatEditing";

export const history = createHistory();

const AuthSwitch = ({ token }) => {
    if (token) {
        console.log("подключение сокета");
        socket.emit("jwt", token);
    }
    return (
        <>
            <Switch>
                <Route path="/login" component={() => <></>} />
                <Route path="/registration" component={() => <></>} />
                <Header />
            </Switch>
            <Route path="/login" component={CLogin} />
            <Route path="/registration" component={CRegistration} />
            <Route path="/profile" component={CProfilePage} />
            <Route path="/newchat" component={CNewChatPage} />
            <Route path="/changepas" component={CChangePass} />
            <Route path="/changesdone" component={ChangesDone} />
            <Route path="/changesdonechats" component={ChangesDoneForChats} />
            <Route path="/chatediting/:_id" component={CChatEditing} />
            <Route path="/aboutus" component={AboutUs} />
            <div className="mainContainer">
                <Route path="/main/" component={CChatsAside} />

                <Route path="/main/:_id" component={CChatMsgs} />
            </div>
            <Redirect
                to={
                    store.getState().auth.token === undefined
                        ? "/login"
                        : "/main"
                }
            />
        </>
    );
};

const CAuthSwitch = connect((state) => ({ token: state.auth.token || null }))(
    AuthSwitch
);

function App() {
    return (
        <>
            <Router history={history}>
                <Provider store={store}>
                    <div className="container">
                        <CAuthSwitch />
                    </div>
                </Provider>
            </Router>
        </>
    );
}

export default App;
