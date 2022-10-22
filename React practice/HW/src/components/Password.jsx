import React from "react";

class PasswordConfirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            passwordConfirm: "",
        };
    }

    inputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    render() {
        const { min } = this.props;
        const arePasswordsEqual =
            this.state.password === this.state.passwordConfirm;
        const hasErrorPsw =
            this.state.password.length < min || !arePasswordsEqual;
        const hasErrorPswConfirm =
            this.state.passwordConfirm.length < min || !arePasswordsEqual;

        return (
            <div className="PasswordConfirmWrapper">
                <h3>Enter Password:</h3>
                <input
                    placeholder={"password"}
                    name={"password"}
                    type={"password"}
                    className={hasErrorPsw ? "error" : ""}
                    onChange={this.inputChange}
                />
                <h3>Enter Password Again:</h3>
                <input
                    placeholder={"confirm password"}
                    name={"passwordConfirm"}
                    type={"password"}
                    className={hasErrorPswConfirm ? "error" : ""}
                    onChange={this.inputChange}
                />
            </div>
        );
    }
}

class PasswordConfirmParent extends React.Component {
    render() {
        return (
            <div>
                <PasswordConfirm min={2} />
            </div>
        );
    }
}

export default PasswordConfirmParent;
