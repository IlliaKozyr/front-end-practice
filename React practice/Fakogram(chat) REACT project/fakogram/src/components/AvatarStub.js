import React from "react";

// const r = () => Math.floor(Math.random() * 256);
// const g = () => Math.floor(Math.random() * 256);
// const b = () => Math.floor(Math.random() * 256);
// export const color = () => {
//     return "#" + r().toString(16) + g().toString(16) + b().toString(16);
// };

export const AvatarStub = (props) => {
    return (
        <div className="stubAvatar" >
            <p className="chatAvatarText">
                {props?.login
                    .split(" ", 2)
                    .map(function (item) {
                        return item[0];
                    })
                    .join("")}
            </p>
        </div>
    );
};

export const AvatarStubHeader = (props) => {
    return (
        <div
            className="stubAvatarHeader"
        >
            <p className="chatAvatarTextHeader">
                {props?.login === undefined ? " " : 
                    props?.login.split(" ", 2)
                    .map(function (item) {
                        return item[0];
                    })
                    .join("")}
            </p>
        </div>
    );
};
