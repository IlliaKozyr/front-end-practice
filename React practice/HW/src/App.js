import logo from "./logo.svg";
import "./App.css";
import SpoilerParent from "./components/Spoiler";
import RangeInputParent from "./components/RangeInput";
import PasswordConfirmParent from "./components/Password";

import TimerParent from "./components/TimerParent";
import TimerControl from './components/TimerControl'

function App() {
    return (
        <div className="App">
            <SpoilerParent></SpoilerParent>
            <div className="block">
                <RangeInputParent></RangeInputParent>
                <PasswordConfirmParent></PasswordConfirmParent>
            </div>
            <div className="blockTimer">
                <TimerParent></TimerParent>
                <TimerControl></TimerControl>
            </div>
        </div>
    );
}

export default App;
