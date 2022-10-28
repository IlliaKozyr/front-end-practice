import React from "react";
import { connect } from "react-redux";

const NickName = ({ nick, login }) => (
    <>
        <h2>{nick}</h2>
        <p>{login}</p>
    </>
);
export const CNickName = connect((state) => ({nick: state.promise?.myProfile?.payload?.nick || " ", login: state.promise?.myProfile?.payload?.login || " "}))(NickName);

