import React, { useState } from "react";

const Spoiler = ({ header = "click me", open, children }) => {
    const [isOpen, setIsOpen] = useState(open);

    return (
        <div>
            <div
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                <span>{header}</span>
                {isOpen && <div>{children}</div>}
            </div>
        </div>
    );
};

const SpoilerParent = () => {
    return (
        <div>
            <div className="header">
                Контент 1
                <p>
                    лорем ипсум траливали и тп.лорем ипсум траливали и тп.лорем
                    ипсум траливали и тп.лорем ипсум траливали и тп.лорем ипсум
                    траливали и тп.
                </p>
            </div>

            <Spoiler>
                <div className="spoilerBlock">
                    Контент 2
                    <p>
                        лорем ипсум траливали и тп.лорем ипсум траливали и
                        тп.лорем ипсум траливали и тп.лорем ипсум траливали и
                        тп.лорем ипсум траливали и тп.
                    </p>
                </div>
            </Spoiler>
        </div>
    );
};

export default SpoilerParent;
