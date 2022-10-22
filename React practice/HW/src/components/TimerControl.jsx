import { useState, useEffect } from "react";

function Timer({sec}) {
    const [count, setCount] = useState(sec);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        let timer;

        if (count > 0 && isPaused === true) {
            timer = setTimeout(() => setCount(count - 1), 1000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [count, isPaused]);

    useEffect(() => {
        setCount(sec);
    }, [sec]);

    const onBtnPauseClick = () => {
        setIsPaused(!isPaused);
    };

    const h = Math.floor(count / 3600);
    const s = count % 60;
    const min = Math.floor(count % 3600 / 60);

    return (
        <div>
            <div>{h < 10 ? '0' + h : h}:{min < 10 ? '0' + min : min}:{s < 10 ? '0' + s : s}</div>
            <button
                className="buttonForTimer"
                onClick={onBtnPauseClick}>
                {isPaused ? 'Pause' : 'Start'}
            </button>
        </div>
    );


}

function TimerControle() {
    const [sec, setSec] = useState(0);
    const [min, setMin] = useState(0);
    const [hours, setHours] = useState(0);

    return (
        <div>
            <input
                name="hours"
                type="number"
                placeholder="Часы"
                onChange={(e) => setHours(+e.target.value)}
            />
            <input
                name="minutes"
                type="number"
                placeholder="Минуты"
                onChange={(e) => setMin(+e.target.value)}
            />
            <input
                name="sec"
                type="number"
                placeholder="Секунды"
                onChange={(e) => setSec(+e.target.value)}
            />
            <Timer sec={hours * 3600 + min * 60 + sec} />
        </div>
    );
}

export default TimerControle;
