import React from "react";
import { Link } from "react-router-dom";

export const ChangesDone = () => {
    return (
        <div className="changesSaved">
            <h1>Changes saved ✔</h1>

            <Link to="/profile" className="changepasLink">
                Back to profile
            </Link>
        </div>
    );
};
