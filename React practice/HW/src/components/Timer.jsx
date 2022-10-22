import {useState, useEffect} from 'react';

function Timer({sec}) {
    const [count, setCount] = useState(sec);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        let timer;

        if (count > 0 && isPaused === false) {
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
                {isPaused ? 'Resume' : 'Pause'}
            </button>
        </div>
    );


}

export default Timer;