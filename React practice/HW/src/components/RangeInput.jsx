import React from "react";

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    inputChange = (e) => {
        this.setState({value: e.target.value});
    };

    render() {
        const {min, max} = this.props;
        const hasError = this.state.value.length > max || this.state.value.length < min;
        return (
            <div>
                <input onChange={this.inputChange} className={hasError ? 'error' : ''}/>
            </div>
        );
    }
}

const RangeInputParent = () => {
    return(
        <RangeInput min={2} max={10} />
    )
 }

export default RangeInputParent