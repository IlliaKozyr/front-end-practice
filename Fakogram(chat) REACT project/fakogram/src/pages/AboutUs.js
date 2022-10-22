import React from "react";
import { Link } from "react-router-dom";

export const AboutUs = () => {
    return(
        <div className="aboutUsStyle">
            <h2>
            Contacts of the creator this wonderful project:
            </h2>
            <a className='nav' target="_blank" href="https://t.me/ilunya_kozyr">Telegram</a>
            <a className='nav' target="_blank" href="mailto:ilunya.kozyr@gmail.com">Email</a>
            <a className='nav' target="_blank" href="https://github.com/IlliaKozyr">GitHub</a>
            <a className='nav' target="_blank" href="https://linkedin.com/in/ilunya-kozyr">Linkedin</a>
        </div>
    )
}