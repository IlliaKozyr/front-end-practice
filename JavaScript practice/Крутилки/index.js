function Control(
	el,
	{
		value = 10,
		min = 0,
		max = 100,
		minAngle = -90,
		maxAngle = 90,
		wheelSpeed = 0.01,
		step = 1,
	} = {}
) {
	const img = document.createElement("img");
	img.src = "img/1@3x.png";
	el.append(img);

	const ratio = (maxAngle - minAngle) / (max - min);
	const getAngle = () => (value - min) * ratio + minAngle;

	this.setValue = (newValue) => {
		if (newValue < min) {
			newValue = min;
		}

		if (newValue > max) {
			newValue = max;
		}

		value = newValue;

		if (typeof this.onchange === "function") {
			this.onchange(value);
		}

		img.style.transform = `rotate(${getAngle()}deg)`;
	};

	this.getValue = () => value;

	img.onmousewheel = (e) => {
		const { deltaY } = e;
		e.preventDefault();
		this.setValue(value + deltaY * wheelSpeed);
	};

	img.onclick = (e) => {
		const { layerX } = e;
		console.log(e, layerX);
		if (layerX > img.width / 2) this.setValue(value + step);
		else this.setValue(value - step);
	};

	this.setValue(value);
}

function setRGB() {
	let a = red.getValue(value * wheelSpeed);
	let b = green.getValue(value * wheelSpeed);
	let c = blue.getValue(value * wheelSpeed);

	let rgbDone = (div.style.background = `rgb(${a}, ${b}, ${c})`);
	return console.log(rgbDone);
}

const red = new Control(container1, { min: 0, max: 255 });
red.onchange = setRGB();
const green = new Control(container1, { min: 0, max: 255 });
green.onchange = setRGB();
const blue = new Control(container1, { min: 0, max: 255 });
blue.onchange = setRGB();

const volumeControl = new Control(container1, { value: 50 });
volumeControl.onchange = (value) => {
	audio.volume = value / 100;
	console.log("ON CHANGE", value);
};

const audio = document.createElement("audio");
audio.setAttribute("controls", "");
audio.src = "/media/klychko.mp3";
document.body.append(audio);

const div = document.createElement("div");
div.style.width = "300px";
div.style.height = "300px";
document.body.append(div);
