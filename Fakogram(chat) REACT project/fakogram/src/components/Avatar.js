import React from "react";
import { connect } from "react-redux";
import { backURL } from "../constants";

function getUrl(obj) {
    if (obj.avatar?.url) {
        return backURL + obj.avatar?.url;
    } else {
        return false;
    }
}

export const UserAvatar = ({ profile, text = "", className = "small" }) => {
    return (
        <>
            <div style={{display: "flex", alignItems: 'center'}}>
                <img className={className} src={getUrl(profile)} />
                <p>{text}</p>
            </div>
            
        </>
    );
};

export const CMyAvatar = connect((state) => ({
    profile: state.promise.myProfile?.payload || {},
}))(UserAvatar);

export const ChatAvatar = ({ userChat, text = "", className = "small", _id }) => {
    return (
        <>
            <div style={{display: "flex", alignItems: 'center'}}>
                {userChat[_id]?.avatar?.url ? <img className={className} src={backURL + userChat[_id]?.avatar?.url} /> : <div className="avatarStubChat"></div>}
                
                <p>{text}</p>
            </div>
            
        </>
    )
}



export const CChatAvatar = connect((state) => ({
    userChat: state.chats || {},
}))(ChatAvatar);
 
const SearchAvatar = ({findUser, avatarUrl}) => {
    return(
        <div className="searchBlock">
            <img src={backURL + avatarUrl?.avatar?.url} className="smallForChat"/>
            
        </div>
    )
}

export const CSearchAvatar = connect((state) => ({findUser: state?.promise?.findUser?.payload}))(
SearchAvatar
)
