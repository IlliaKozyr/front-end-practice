import React from "react";
import { Link } from "react-router-dom";

export const ChangesDoneForChats = () => {
    return (
        <div className="changesSaved">
            <h1>Changes saved ✔</h1>

            <Link to="/main/" className="changepasLink">
                Back to all chats
            </Link>
        </div>
    );
};