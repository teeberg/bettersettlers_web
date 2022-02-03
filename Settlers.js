// Copyright 2008 Better Settlers Inc.
// Author: aflynn@gmail.com (Andrew Flynn)


class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	equals(other) {
		return (
			this.x === other.x &&
			this.y === other.y
		);
	}
}


function intToColor(intColor) {
	let hex = intColor.toString(16);
	console.assert(hex.length <= 6);
	let pad = 6 - hex.length;
	hex = '#' + '0'.repeat(pad) + hex;
	return hex;
}


function setQueryArg(name, value) {
	// https://stackoverflow.com/a/41542008/471441
	if ('URLSearchParams' in window) {
		const searchParams = new URLSearchParams(window.location.search)
		searchParams.set(name, value);
		const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
		history.replaceState(null, '', newRelativePathQuery);
	}
}


function getQueryArg(name, defaultValue) {
	if ('URLSearchParams' in window) {
		const searchParams = new URLSearchParams(window.location.search)
		const value = searchParams.get(name);
		if (value !== null) {
			return value;
		}
	}
	return defaultValue;
}


const sizeHandlers = {
	'standard': shiftToStandard,
	'large': shiftToLarge,
	'xlarge': shiftToXlarge,
}


let xd = 40;
let two_xd = xd * 2;
let yd1 = 27;
let yd2 = 42;
let ydt = yd1 + yd2;

let tileWidth = two_xd;
let tileHeight = yd2 + yd1 * 2;

const STANDARD = -1;
const LARGE = -2;
const XLARGE = -3;
const CUSTOM = -4;

const SHEEP = 0x00CD00;
const ROCK = 0x808080;
const CLAY = 0x560000;
const WOOD = 0x004B00;
const WATER = 0x0066CC;
const WHEAT = 0xFFFF00;
const DESERT = 0xFFCC32;
const BLANK = 0x111111;
const LAND = 0x939331;

const RESOURCE_CYCLE = {};
RESOURCE_CYCLE[SHEEP] = ROCK;
RESOURCE_CYCLE[ROCK] = CLAY;
RESOURCE_CYCLE[CLAY] = WOOD;
RESOURCE_CYCLE[WOOD] = WHEAT
RESOURCE_CYCLE[WHEAT] = SHEEP;
RESOURCE_CYCLE[BLANK] = LAND;
RESOURCE_CYCLE[LAND] = WATER;
RESOURCE_CYCLE[WATER] = BLANK;

const STARTING_X_VALUE = xd;
const STARTING_Y_VALUE = 0;

const BOARD_RANGE_X_VALUE = 14;
const BOARD_RANGE_Y_VALUE = 8;

/**
 * Mapping between the numbers that are shown (rolled on the dice) and the probability of each
 * being rolled.
 */
const PROBABILITY_MAPPING = [
	0,  // 0
    0,  // 1
    1,  // 2
    2,  // 3
    3,  // 4
    4,  // 5
    5,  // 6
    0,  // 7
    5,  // 8
    4,  // 9
    3,  // 10
    2,  // 11
    1,  // 12
];

let map_type;
let num_of_sheep;
let num_of_wheat;
let num_of_wood;
let num_of_rock;
let num_of_clay;
let available_probabilities;
let available_resources;
let available_harbors;
let land_grid;
let water_grid;
let harbor_lines;
let land_neighbors;
let water_neighbors;
let land_intersections;

// 2  3  4  5 6
// 12 11 10 9 8
const DEFAULT_AVAILABLE_PROBABILITIES = [
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
	5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
];

const DEFAULT_AVAILABLE_RESOURCES = [
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
	SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT,
];

const DEFAULT_AVAILABLE_HARBORS = [
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
	DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
];

const STANDARD_AVAILABLE_PROBABILITIES = [
	2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
];

const STANDARD_AVAILABLE_RESOURCES = [
	SHEEP, SHEEP, SHEEP, SHEEP,
	WHEAT, WHEAT, WHEAT, WHEAT,
	WOOD, WOOD,	WOOD, WOOD,
	ROCK, ROCK,	ROCK, CLAY,
	CLAY, CLAY,	DESERT,
];

const STANDARD_AVAILABLE_HARBORS = [
	SHEEP,
	WHEAT,
	WOOD,
	ROCK,
	CLAY,
	DESERT,
	DESERT,
	DESERT,
	DESERT,
];

const STANDARD_LAND_GRID = [
	new Point(4, 2),
	new Point(6, 2),
	new Point(8, 2),
	new Point(3, 3),
	new Point(5, 3),
	new Point(7, 3),
	new Point(9, 3),
	new Point(2, 4),
	new Point(4, 4),
	new Point(6, 4),
	new Point(8, 4),
	new Point(10, 4),
	new Point(3, 5),
	new Point(5, 5),
	new Point(7, 5),
	new Point(9, 5),
	new Point(4, 6),
	new Point(6, 6),
	new Point(8, 6),
];

const STANDARD_WATER_GRID = [
	new Point(3, 1),
	new Point(5, 1),
	new Point(7, 1),
	new Point(9, 1),
	new Point(10, 2),
	new Point(11, 3),
	new Point(12, 4),
	new Point(11, 5),
	new Point(10, 6),
	new Point(9, 7),
	new Point(7, 7),
	new Point(5, 7),
	new Point(3, 7),
	new Point(2, 6),
	new Point(1, 5),
	new Point(0, 4),
	new Point(1, 3),
	new Point(2, 2),
];

/**
 * LARGE BOARD (5 ppl)
 * List of how many of each probability this type of board contains
 */
const LARGE_AVAILABLE_PROBABILITIES = [2,3,3,4,4,5,5,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12];

/**
 * LARGE BOARD (5 ppl)
 * List of how many of each resource this type of board contains
 */
const LARGE_AVAILABLE_RESOURCES = [
	SHEEP, SHEEP, SHEEP, SHEEP, SHEEP,  // 5 Sheep
	WHEAT, WHEAT, WHEAT, WHEAT, WHEAT,  // 5 Wheat
	WOOD, WOOD, WOOD, WOOD, WOOD,   // 5 Wood
	ROCK, ROCK, ROCK, ROCK,   // 4 Rock
	CLAY, CLAY,	CLAY, CLAY,   // 4 Clay
	DESERT,   // 1 Desert
];

/**
 * LARGE BOARD (5 ppl)
 * List of how many of harbors there are (desert is 3:1)
 */
const LARGE_AVAILABLE_HARBORS = [
	SHEEP,  // 1 Sheep 2:1
	WHEAT,  // 1 Wheat 2:1
	WOOD,   // 1 Wood 2:1
	ROCK,   // 1 Rock 2:1
	CLAY,   // 1 Clay 2:1
	DESERT, // 5 3:1's
	DESERT,
	DESERT,
	DESERT,
	DESERT,
];

/**
 * LARGE BOARD (5 ppl)
 * The (x,y) coordinates of the top left corner of each land hexagon for drawing purposes.
 */
const LARGE_LAND_GRID = [
	new Point(4,2),  // 0
	new Point(6,2),  // 1
	new Point(8,2),  // 2
	new Point(10,2), // 3
	new Point(3,3),  // 4
	new Point(5,3),  // 5
	new Point(7,3),  // 6
	new Point(9,3),  // 7
	new Point(11,3), // 8
	new Point(2,4),  // 9
	new Point(4,4),  // 10
	new Point(6,4),  // 11
	new Point(8,4),  // 12
	new Point(10,4), // 13
	new Point(12,4), // 14
	new Point(3,5),  // 15
	new Point(5,5),  // 16
	new Point(7,5),  // 17
	new Point(9,5),  // 18
	new Point(11,5), // 19
	new Point(4,6),  // 20
	new Point(6,6),  // 21
	new Point(8,6),  // 22
	new Point(10,6)
];  // 23

/**
 * LARGE BOARD (5 ppl)
 * The (x,y) coordinates of the top left corner of each ocean hexagon for drawing purposes.
 */
const LARGE_WATER_GRID = [
	new Point(3,1),  // 0
	new Point(5,1),  // 1
	new Point(7,1),  // 2
	new Point(9,1),  // 3
	new Point(11,1), // 4
	new Point(12,2), // 5
	new Point(13,3), // 6
	new Point(14,4), // 7
	new Point(13,5), // 8
	new Point(12,6), // 9
	new Point(11,7), // 10
	new Point(9,7),  // 11
	new Point(7,7),  // 12
	new Point(5,7),  // 13
	new Point(3,7),  // 14
	new Point(2,6),  // 15
	new Point(1,5),  // 16
	new Point(0,4),  // 17
	new Point(1,3),  // 18
	new Point(2,2),  // 19
];

/**
 * XLARGE BOARD (6 ppl) List of how many of each probability this type of board contains
 */
const XLARGE_AVAILABLE_PROBABILITIES = [2,2,3,3,3,4,4,4,5,5,5,6,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12];

/**
 * XLARGE BOARD (6 ppl) List of how many of each resource this type of board contains
 */
const XLARGE_AVAILABLE_RESOURCES = [
	SHEEP, // 6 Sheep
	SHEEP,
	SHEEP,
	SHEEP,
	SHEEP,
	SHEEP,
	WHEAT, // 6 Wheat
	WHEAT,
	WHEAT,
	WHEAT,
	WHEAT,
	WHEAT,
	WOOD,  // 6 Wood
	WOOD,
	WOOD,
	WOOD,
	WOOD,
	WOOD,
	ROCK,  // 5 Rock
	ROCK,
	ROCK,
	ROCK,
	ROCK,
	CLAY,  // 5 Clay
	CLAY,
	CLAY,
	CLAY,
	CLAY,
	DESERT, // 2 Desert
	DESERT,
];

/**
 * XLARGE BOARD (6 ppl) List of how many of harbors there are (desert is 3:1)
 */
const XLARGE_AVAILABLE_HARBORS = [
	SHEEP,  // 2 Sheep 2:1's
	SHEEP,
	WHEAT,  // 1 Wheat 2:1
	WOOD,   // 1 Wood 2:1
	ROCK,   // 1 Rock 2:1
	CLAY,   // 1 Clay 2:1
	DESERT, // 5 3:1's
	DESERT,
	DESERT,
	DESERT,
	DESERT,
];

/**
 * XLARGE BOARD (6 ppl) The (x,y) pixels of the TL corner of each land hexagon for drawing purposes.
 */
const XLARGE_LAND_GRID = [
	new Point(5,1),  // 0
	new Point(7,1),  // 1
	new Point(9,1),  // 2
	new Point(4,2),  // 3
	new Point(6,2),  // 4
	new Point(8,2),  // 5
	new Point(10,2), // 6
	new Point(3,3),  // 7
	new Point(5,3),  // 8
	new Point(7,3),  // 9
	new Point(9,3),  // 10
	new Point(11,3), // 11
	new Point(2,4),  // 12
	new Point(4,4),  // 13
	new Point(6,4),  // 14
	new Point(8,4),  // 15
	new Point(10,4), // 16
	new Point(12,4), // 17
	new Point(3,5),  // 18
	new Point(5,5),  // 19
	new Point(7,5),  // 20
	new Point(9,5),  // 21
	new Point(11,5), // 22
	new Point(4,6),  // 23
	new Point(6,6),  // 24
	new Point(8,6),  // 25
	new Point(10,6), // 26
	new Point(5,7),  // 27
	new Point(7,7),  // 28
	new Point(9,7),
]; // 29

/**
 * XLARGE BOARD (6 ppl) The (x,y) pixels of the TL corner of each ocean hexagon for drawing purposes.
 */
const XLARGE_WATER_GRID = [
	new Point(4,0),  // 0
	new Point(6,0),  // 1
	new Point(8,0),  // 2
	new Point(10,0), // 3
	new Point(11,1), // 4
	new Point(12,2), // 5
	new Point(13,3), // 6
	new Point(14,4), // 7
	new Point(13,5), // 8
	new Point(12,6), // 9
	new Point(11,7), // 10
	new Point(10,8), // 11
	new Point(8,8),  // 12
	new Point(6,8),  // 13
	new Point(4,8),  // 14
	new Point(3,7),  // 15
	new Point(2,6),  // 16
	new Point(1,5),  // 17
	new Point(0,4),  // 18
	new Point(1,3),  // 19
	new Point(2,2),  // 20
	new Point(3,1),
]; // 21

let sprites = [];
let hexesToPoints = new WeakMap();
let hexesToColor = {}
let hexesBaggage = {};
let hexes = [];

let the_map = new Array(BOARD_RANGE_X_VALUE+1);
let resource_map = [];
let probability_map = [];
let harbor_map = [];

const svg = document.getElementById('svg');

const helpText = document.getElementById('help');

const generate_map_button = document.getElementById('generate_map_button');
generate_map_button.addEventListener('click', generateMap);

const shuffle_probabilities_button = document.getElementById('shuffle_probabilities_button');
shuffle_probabilities_button.addEventListener('click', shuffleProbabilities);

const shuffle_harbors_button = document.getElementById('shuffle_harbors_button');
shuffle_harbors_button.addEventListener('click', shuffleHarbors);

const standard_radio = document.getElementById('standard_radio');
standard_radio.addEventListener('click', sizeHandlers['standard']);

const large_radio = document.getElementById('large_radio');
large_radio.addEventListener('click', sizeHandlers['large']);

const xlarge_radio = document.getElementById('xlarge_radio');
xlarge_radio.addEventListener('click', sizeHandlers['xlarge']);

const reset_map_button = document.getElementById('reset_map_button');
reset_map_button.addEventListener('click', resetMap);


function svgText(x, y, className, contents, options) {
	if (options === undefined) {
		options = {};
	}

	const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
	const attrs = {
		'x': x,
		'y': y,
		'class': className,
	}
	if (options.mouseEnabled !== true) {
		attrs['pointer-events'] = 'none';
	}
	for (const [key, value] of Object.entries(attrs)) {
		text.setAttribute(key, value);
	}
	if (options.color !== undefined) {
		text.style.fill = intToColor(options.color);
	}
	text.innerHTML = contents;
	svg.appendChild(text);
	return text;
}

function svgLine(start, end, thickness, color, options) {
	if (options === undefined) {
		options = {};
	}

	const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
	const attrs = {
		'x1': start.x,
		'y1': start.y,
		'x2': end.x,
		'y2': end.y,
	}
	if (options.mouseEnabled !== true) {
		attrs['pointer-events'] = 'none';
	}
	for (const [key, value] of Object.entries(attrs)) {
		line.setAttribute(key, value);
	}

	line.style.strokeWidth = thickness;
	line.style.stroke = intToColor(color);
	svg.appendChild(line);
	return line;
}


function svgCircle(x, y, radius, color, options) {
	if (options === undefined) {
		options = {};
	}
	const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
	const attrs = {
		'cx': x,
		'cy': y,
		'r': radius,
		'fill': intToColor(color),
		'stroke': 'black',
		'stroke-width': 3,
	}
	if (options.strokeWidth !== undefined) {
		attrs['stroke-width'] = options.strokeWidth;
	}
	for (const [key, value] of Object.entries(attrs)) {
		circle.setAttribute(key, value);
	}
	if (options.mouseEnabled === false) {
		circle.setAttribute('pointer-events', 'none')
	}

	svg.appendChild(circle);
	return circle;
}


function svgPolygon(points, options) {
	// <polygon points="200,10 250,190 160,210" style="fill:lime;stroke:purple;stroke-width:1" />
	if (options === undefined) {
		options = {};
	}
	const polygon = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
	points = points.map((point) => {
		if (point instanceof Point) {
			return `${point.x},${point.y}`
		}
		return point;
	});
	polygon.setAttribute('points', points.join(' '));

	polygon.style.stroke = 'white';
	polygon.style.strokeWidth = 1;

	if (options.color !== undefined) {
		polygon.style.fill = intToColor(options.color);
	}

	svg.appendChild(polygon);
	return polygon;
}


function svgHexagon(points, color) {
	return svgPolygon(points, {
		color: color,
	});
}


function svgTile(x, y, color) {
	const points = [
		new Point(x, y),
		new Point(x+xd, y+yd1),
		new Point(x+xd, y+yd1+yd2),
		new Point(x, y+yd1+yd2+yd1),
		new Point(x-xd, y+yd1+yd2),
		new Point(x-xd, y+yd1),
	];
	return svgHexagon(points, color);
}


/*
let file = new FileReference();
upload_file_button.addEventListener('click', uploadFile);
file.addEventListener(Event.SELECT, selectFile);

let xml_loader = new URLLoader();
xml_loader.addEventListener(Event.COMPLETE, loadCustomMap);

function uploadFile(evt) {
	//file.browse(new Array(new FileFilter("Maps", "*.map")));
	xml_loader.load(new URLRequest("standard.map"));
}

function loadCustomMap(evt) {
	let xml = new XML(evt.target.data);
	console.log(xml);
}

function selectFile(evt) {
	file = FileReference(evt.target);
	//console.log("File chosen:" + file.name + ", size: " + file.size);
}
*/

/* Start here */
map_type = STANDARD;
available_probabilities = STANDARD_AVAILABLE_PROBABILITIES;
available_resources = STANDARD_AVAILABLE_RESOURCES;
available_harbors = STANDARD_AVAILABLE_HARBORS;
land_grid = STANDARD_LAND_GRID;
water_grid = STANDARD_WATER_GRID;


function init() {
	createGlobalMap(false /* showGrid */);

	const size = getQueryArg('size', 'standard');
	let elements = document.getElementsByName('size');
	elements.forEach((elem) => {
		if (elem.id === `${size}_radio`) {
			elem.checked = true;
			sizeHandlers[size]();
		}
	});
}


function calculateOthers() {
	num_of_sheep = getNumberOf(SHEEP, available_resources);
	num_of_rock = getNumberOf(ROCK, available_resources);
	num_of_clay = getNumberOf(CLAY, available_resources);
	num_of_wheat = getNumberOf(WHEAT, available_resources);
	num_of_wood = getNumberOf(WOOD, available_resources);
	harbor_lines = getHarborLinePossibilities(water_grid, land_grid);
	land_neighbors = getAllLandNeighbors(land_grid);
	water_neighbors = getAllWaterNeighbors(water_grid, land_grid);
	land_intersections = getIntersections(land_grid, land_neighbors);
}

function shiftToStandard(evt) {
	setQueryArg('size', 'standard');
	cleanUp(true /* help text */);
	map_type = STANDARD;
	available_probabilities = STANDARD_AVAILABLE_PROBABILITIES;
	available_resources = STANDARD_AVAILABLE_RESOURCES;
	available_harbors = STANDARD_AVAILABLE_HARBORS;
	land_grid = STANDARD_LAND_GRID;
	water_grid = STANDARD_WATER_GRID;
	calculateOthers();
	generateMap(evt);
}

function shiftToLarge(evt) {
	setQueryArg('size', 'large');
	cleanUp(true /* help text */);
	map_type = LARGE;
	available_probabilities = LARGE_AVAILABLE_PROBABILITIES;
	available_resources = LARGE_AVAILABLE_RESOURCES;
	available_harbors = LARGE_AVAILABLE_HARBORS;
	land_grid = LARGE_LAND_GRID;
	water_grid = LARGE_WATER_GRID;
	calculateOthers();
	generateMap(evt);
}

function shiftToXlarge(evt) {
	setQueryArg('size', 'xlarge');
	cleanUp(true /* help text */);
	map_type = XLARGE;
	available_probabilities = XLARGE_AVAILABLE_PROBABILITIES;
	available_resources = XLARGE_AVAILABLE_RESOURCES;
	available_harbors = XLARGE_AVAILABLE_HARBORS;
	land_grid = XLARGE_LAND_GRID;
	water_grid = XLARGE_WATER_GRID;
	calculateOthers();
	generateMap(evt);
}

function resetMap() {
	cleanUp(true /* help text */);
	map_type = CUSTOM;
	available_probabilities = [];
	available_resources = [];
	available_harbors = [];
	land_grid = [];
	water_grid = [];
	calculateOthers();
	createGlobalMap(true /* showGrid */);
	//drawBoard(true /* blank */);
}

function generateMap(evt) {
	svg.innerHTML = '';

	cleanUp(true /* help text */);
	if (map_type === CUSTOM) {
		let land_len = land_grid.length;

		if (land_len > 0) {
			available_probabilities = [];
			available_resources = [];
			available_harbors = [];

			for (let l = 0; l < land_len; l++) {
				available_probabilities.push(DEFAULT_AVAILABLE_PROBABILITIES[l]);
				available_resources.push(DEFAULT_AVAILABLE_RESOURCES[l]);
			}
			for (let w = 0; w < water_grid.length; w += 2) {
				available_harbors.push(DEFAULT_AVAILABLE_HARBORS[w]);
			}
			// Deal with deserts
			available_resources.forEach((res) => {
				if (res === DESERT) {
					available_probabilities.pop();
				}
			});
			calculateOthers();
			generate();
			drawBoard(false /* blank */);
		} else {
			shiftToStandard(evt);
		}
	} else {
		//createGlobalMap();
		generate();
		drawBoard(false /* blank */);
	}
}

/** Do everything but get new resources */
function shuffleProbabilities() {
	cleanUp(true /* help text */);
	let finding_map = true;
	while (finding_map) {
		let probabilities = getProbabilities();

		let counter = 0;
		while (counter < 10000) {
			let temp_probabilities = deepCopy(
			  probabilities);
			probability_map = getNumberedBoard(
			  resource_map, temp_probabilities);
			if (checkCollisionsAndProbability(probability_map)) {
				finding_map = false;
				break;
			}
			counter++;
		}
	}
	drawBoard(false  /* blank */);
}

function shuffleHarbors() {
	cleanUp(true /* help text */);
	harbor_map = getHarbors(resource_map, probability_map);
	drawBoard(false  /* blank */);
}

function generate() {
	let uber_counter = 0;
	while (uber_counter < 10) {
		resource_map = getBalancedBoard();
		let probabilities = getProbabilities();

		let counter = 0;
		while (counter < 10000) {
			let temp_probabilities = deepCopy(
			  probabilities);
			probability_map = getNumberedBoard(
			  resource_map, temp_probabilities);
			if (checkCollisionsAndProbability(probability_map)) {
				uber_counter=10;
				break;
			}
			counter++;
		}
		uber_counter++;
	}
	harbor_map = getHarbors(resource_map, probability_map);
}

function createGlobalMap(showGrid) {
	for (let a = 0; a < the_map.length; a++) {
		the_map[a] = new Array(BOARD_RANGE_Y_VALUE+1);
	}
	for (let i = 0; i <= BOARD_RANGE_Y_VALUE; i++) {
		for (let j = (i%2); j <= BOARD_RANGE_X_VALUE; j+=2) {
			let temp = new Point(
				(xd*j)+STARTING_X_VALUE,
				(ydt*i)+STARTING_Y_VALUE,
			);
			the_map[j][i] = temp;
			if (showGrid) {
				/*
				let txt = new TextField();
				let txt_format = new TextFormat();
				txt.text = "(" + j + ", " + i + ")";
				txt_format.color = 0xFFFFFF;
				txt_format.font = "courier new";
				txt_format.size = 20;
				txt_format.bold = true;
				txt_format.align = "center";
				txt.x = temp.x-two_xd/2-10;
				txt.y = temp.y+ydt/2-5;
				txt.setTextFormat(txt_format);
				drawHex(temp.x, temp.y, BLANK, null, txt);
				*/
				drawHex(temp.x, temp.y, BLANK, null, null);
			}
		}
	}
	if (showGrid) {
		helpText.style.visibility = 'visible';
	}
}

function getBalancedBoard() {
	let set = [];
	let tried = [];
	let avail = initAvail();
	let refill_avail = false;

	while (tried.length !== 0 || avail.length !== 0) {
		if (refill_avail) {
			avail = avail.concat(tried);
			tried = [];
		}
		if (avail.length === 0) {
			set = [];
			tried = [];
			avail = initAvail();
		} else {
			// Reshuffle a random number of them
			let rand = nextInt(avail.length);
			for (let i = 0; i < rand; i++) {
				avail.push(avail.shift());
			}
			let resource = avail.pop();

			let next_index = set.length;
			let can_place_here = true;
			land_neighbors[next_index].forEach((neighbor) => {
				if (neighbor > set.length) {
					// Do nothing, it isn't occupied yet
				} else {
					if (set[neighbor] === resource) {
						can_place_here = false;
						return;
					} else {
						// Do nothing, this neighbor isn't the same
					}
				}
			})
			if (can_place_here) {
				refill_avail = true;
				set.push(resource);
			} else {
				refill_avail = false;
				tried.push(resource);
			}
		}
	}
	return set;
}

/**
 * Helper function for getBalancedBoard
 */
function initAvail() {
	let avail = [];
	available_resources.forEach((resource) => {
		avail.push(resource);
	})
	return avail;
}

function getProbabilities() {
	let probs = {};
	let numbers = initProbabilities();
	let sheeps = [];
	let woods = [];
	let rocks = [];
	let clays = [];
	let wheats = [];

	while (true) {
		numbers = initProbabilities();
		sheeps = [];
		woods = [];
		rocks = [];
		clays = [];
		wheats = [];

		// Assign numbers completely randomly to each resource
		while (numbers.length !== 0) {
			// Reshuffle a random number of them
			let rand = nextInt(numbers.length);
			for (let i=0; i<rand; i++) {
				numbers.push(numbers.shift());
			}

			if (sheeps.length < num_of_sheep) {
				sheeps.push(numbers.pop());
			}
			else if (woods.length < num_of_wood) {
				woods.push(numbers.pop());
			}
			else if (wheats.length < num_of_wheat) {
				wheats.push(numbers.pop());
			}
			else if (rocks.length < num_of_rock) {
				rocks.push(numbers.pop());
			}
			else if (clays.length < num_of_clay) {
				clays.push(numbers.pop());
			}
		}

		// Try out to see if
		// a) any resource has two of the same numbers or
		// b) the probability of a single resource is too high or low or
		// c) within each resource, no one tile has more than half the probability
		//
		// This is different per the size of the map
		let magic_low;
		let magic_high;
		let tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
		if (tot <= 5) { // Anything is okay
			magic_low = 0;
			magic_high = 5;
		} else if (tot <= 10) { // Still somewhat hard to deal with
			magic_low = 2;
			magic_high = 4;
		} else if (tot <= 30) { // Up to same as XLARGE
			magic_low = 3;
			magic_high = 4;
		} else { // Anything else anything is okay
			magic_low = 0
			magic_high = 5;
		}
		if (noDuplicates(sheeps) && noDuplicates(woods) && noDuplicates(wheats)
				&& noDuplicates(rocks) && noDuplicates(clays)

				&& sumProbability(sheeps) >= magic_low*num_of_sheep
				&& sumProbability(sheeps) <= magic_high*num_of_sheep

				&& sumProbability(woods) >= magic_low*num_of_wood
				&& sumProbability(woods) <= magic_high*num_of_wood

				&& sumProbability(wheats) >= magic_low*num_of_wheat
				&& sumProbability(wheats) <= magic_high*num_of_wheat

				&& sumProbability(rocks) >= magic_low*num_of_rock
				&& sumProbability(rocks) <= magic_high*num_of_rock

				&& sumProbability(clays) >= magic_low*num_of_clay
				&& sumProbability(clays) <= magic_high*num_of_clay

				&& isBalanced(rocks) && isBalanced(clays)) {
			break;
		}
	}
	probs[SHEEP] = sheeps;
	probs[WOOD] = woods;
	probs[CLAY] = clays;
	probs[ROCK] = rocks;
	probs[WHEAT] = wheats;

	return probs;
}

/**
 * Add in each of the probability pieces into an array and return it.
 * Helper function for getProbabilities()
 */
function initProbabilities() {
	let numbers = [];
	available_probabilities.forEach((prob) => {
		numbers.push(prob);
	})
	return numbers;
}

function noDuplicates(numbers) {
	let num_found = 0;
	let len = numbers.length;

	while (len > 0) {
		let num = numbers.pop();
		len--;
		if (numbers.indexOf(num) !== -1) {
			num_found++;
		}
		numbers.unshift(num);
	}
	let tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
	if (tot > 30) {
		return true;
	}
	return (num_found === 0);
}

function isBalanced(numbers) {
	let len = numbers.length;
	// If we have less than 3, return true automatically
	if (len < 3) {
		return true;
	}
	while (len > 0) {
		let num = numbers.shift();
		len--;
		if (PROBABILITY_MAPPING[num] > sumProbability(numbers)) {
			return false;
		}
		numbers.unshift(num);
	}
	return true;
}

function sumProbability(numbers) {
	let sum = 0;
	numbers.forEach((num) => {
		sum += PROBABILITY_MAPPING[num];
	});
	return sum;
}

function deepCopy(dict) {
	let new_dict = {};
	for (const [resource, probs] of Object.entries(dict)) {
		let copy = [];
		probs.forEach((prob) => {
			copy.push(prob);
		});
		new_dict[resource] = copy;
	}
	return new_dict;
}

function getNumberedBoard(resources, probabilities) {
	let probabilities_map = [];
	resources.forEach((resource) => {
		if (resource === DESERT) {
			probabilities_map.push(resource);
		} else {
			let res_probs = probabilities[resource];
			// Reshuffle a random number of them
			let rand = nextInt(res_probs.length);
			for (let i=0; i<rand; i++) {
				res_probs.push(res_probs.shift());
			}
			probabilities_map.push(res_probs.pop());
		}
	});
	return probabilities_map;
}

function checkCollisionsAndProbability(probabilities) {
	land_intersections.forEach((triplet) => {
		let temp_triplets = [];
		triplet.forEach((trip) => {
			temp_triplets.push(probabilities[trip]);
		});
		if (!noDuplicates(temp_triplets)) {
			return false;
		} else {
			let tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
			if (tot > 30) {
				return true;
			}
			if (temp_triplets.indexOf(0) !== -1) {
				if (map_type === STANDARD) {
					// Has a desert: x < 8
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				} else if (map_type === LARGE) {
					// Has a desert: x < 9
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				} else if (map_type === XLARGE || map_type === CUSTOM) {
					// Has two deserts: x < 10
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				}
			} else {
				if (map_type === STANDARD) {
					// Prob: x < 11
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				} else if (map_type === LARGE) {
					// Prob: x < 12
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				} else if (map_type === XLARGE || map_type === CUSTOM) {
					// Prob: x < 13
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				}
			}
		}
	});
	return true;
}

function getHarbors(resources, probabilities) {
	let harbors = [];
	let left = [];

	while (true) {
		left = initHarbors();
		harbors = [];

		// Quick coin-flip to see if we start with a harbor or open ocean
		if (nextInt(2) !== 0) {
			while (left.length !== 0 && harbors.length < water_grid.length) {
				// Reshuffle a random number of them
				let rand = nextInt(left.length);
				for (let r1=0; r1<rand; r1++) {
					left.push(left.shift());
				}

				if (harbors.length < water_grid.length) {
					let tmp_array = [];
					tmp_array[0] = left.pop();
					harbors.push(tmp_array);
				}
				if (harbors.length < water_grid.length) {
					let tmp_array_b = [];
					tmp_array_b[0] = WATER;
					harbors.push(tmp_array_b);
				}
			}
		} else {
			while (left.length !== 0 && harbors.length < water_grid.length) {
				// Reshuffle a random number of them
				let rand = nextInt(left.length);
				for (let r2=0; r2<rand; r2++) {
					left.push(left.shift());
				}

				if (harbors.length < water_grid.length) {
					let tmp_array_2b = [];
					tmp_array_2b[0] = WATER;
					harbors.push(tmp_array_2b);
				}
				if (harbors.length < water_grid.length) {
					let tmp_array2 = [];
					tmp_array2[0] = left.pop();
					harbors.push(tmp_array2);
				}
			}
		}

		// Fill the rest with water
		while (harbors.length < water_grid.length) {
			let tmps = [];
			tmps[0] = WATER;
			harbors.push(tmps);
		}

		// Check to see if things are fair
		let fair = true;
		for (let i=0; i<harbors.length; i++) {
			if (harbors[i][0] === DESERT || harbors[i][0] === WATER) {
				// continue;
			} else {
				let facing = water_neighbors[i];
				facing.forEach((land_ind) => {
					let land_prob = probabilities[land_ind];
					let land_res = resources[land_ind];
					if (
						land_res === harbors[i][0] &&
						land_prob >= 5 &&
						land_prob <=9
					) {
						fair = false;
					}
				});
			}
		}
		if (fair) {
			// Position harbors
			for (let j=0; j<harbors.length; j++) {
				let len = harbor_lines[j].length;
				let ran = nextInt(len);
				harbors[j][1] = harbor_lines[j][ran];
				harbors[j][2] = nextGoodHarborLine(harbor_lines[j], ran);
			}
			break;
		}
	}
	return harbors;
}

function nextGoodHarborLine(lines, seed) {
	for (let i=0; i < lines.length; i++) {
		let cand = lines[i];
		if (1 === Math.abs(lines[seed] - lines[i])
			|| 5 === Math.abs(lines[seed] - lines[i])) {
			return cand;
		}
	}
	return -1;
}

function initHarbors() {
	let new_harbors = [];
	available_harbors.forEach((res) => {
		new_harbors.push(res);
	});
	return new_harbors;
}

function drawBoard(blank) {
	for (let i = 0; i < land_grid.length; i++) {
		let a = land_grid[i].x;
		let b = land_grid[i].y;
		let pt = new Point();
		pt.x = the_map[a][b].x;
		pt.y = the_map[a][b].y;
		//console.log("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		if (blank) {
			drawHex(pt.x, pt.y, BLANK /* gray */, null, null);
		} else if (resource_map[i] === DESERT) {
			drawHex(pt.x, pt.y, resource_map[i], null, null);
		} else {
			let prob = probability_map[i];
			drawHex(pt.x, pt.y, resource_map[i], prob, null);
		}
	}
	for (let j=0; j<water_grid.length; j++) {
		let c = water_grid[j].x;
		let d = water_grid[j].y;
		let pt2 = new Point();
		pt2.x = the_map[c][d].x;
		pt2.y = the_map[c][d].y;
		//console.log("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		if (blank) {
			let tmp_harbor_map = [];
			tmp_harbor_map[0] = WATER;
			drawWaterHex(pt2.x, pt2.y, tmp_harbor_map);
		} else {
			drawWaterHex(pt2.x, pt2.y, harbor_map[j]);
		}
	}
}

function drawWaterHex(x, y, harbor_point) {
	let hex = svgTile(x, y, WATER);
	//hex.addEventListener('mousedown', dragDown);
	//hex.addEventListener('mouseup', dragUp);
	//hex.addEventListener('click', clickHex);
	//hex.addEventListener('mouseover', rollOverHex);
	let hex_baggage = [];
	if (harbor_point[0] !== WATER) {
		let harborChildren = getHarborLines(x, y, harbor_point);
		let txt = getHarborNumber(x, y, harbor_point[0]);
		txt.mouseEnabled = false;
		hex_baggage.push(harborChildren);
		hex_baggage.push(txt);
	}
	// stage.addChildAt(hex, 0);
	sprites.push(hex);
	hexesToPoints.set(hex, new Point(x, y));
	hexesToColor[hex] = harbor_point[0];
	hexesBaggage[hex] = hex_baggage;
	hexes.push(hex);
}

function getHarborLines(x, y, harbor_point) {
	let children = [];
	let color = harbor_point[0];
	let dirs;
	if (color === WATER) {
		dirs = null;
	} else {
		dirs = [harbor_point[1], harbor_point[2]];
	}
	if (color === DESERT) {
		color = 0xFFFFFF;
	}

	const start = new Point(x, y+yd1+yd2/2);
	dirs.forEach((dir) => {

		let end;
		switch (dir) {
			case 0:
				end = new Point(x-xd+4, y+yd1+4);
				break;
			case 1:
				end = new Point(x, y+4);
				break;
			case 2:
				end = new Point(x+xd-4, y+yd1+4);
				break;
			case 3:
				end = new Point(x+xd-4, y+yd1+yd2-4);
				break;
			case 4:
				end = new Point(x, y+yd1*2+yd2-4);
				break;
			case 5:
				end = new Point(x-xd+4, y+yd1+yd2-4);
				break;
			default:
				throw new Error(`Unexpected direction: ${dir}`);
		}
		children.push(svgLine(start, end, 4, color, {mouseEnabled: false}));
	});
	children.push(svgCircle(x, y+yd1+yd2/2, 15, color));
	return children;
}


function getHarborNumber(x, y, color) {
	let txt;
	if (color === DESERT) {
		txt = getProbText(x, y+8, 3, 0x000000);
	} else {
		txt = getProbText(x, y+8, 2, 0x000000);
	}
	txt.mouseEnabled = false;
	return txt;
}


function drawHex(x, y, color, prob, field) {
	let hex = svgTile(x, y, color);
	//hex.addEventListener('mousedown', pressDown);
	//hex.addEventListener('mouseup', dragUp);
	hex.addEventListener('mousedown', (e) => {
		// Disable text selection when double-clicking hex
		e.preventDefault();
	})
	hex.addEventListener('click', clickLandHex);
	//hex.addEventListener(MouseEvent.MOUSE_OVER, rollOverHex);
	let hex_baggage = [];
	if (prob != null) {
		let txt;
		let dots;
		if (prob === 6 || prob === 8) {
			txt = getProbText(x, y, prob, 0xCC0000);
			dots = getDots(x, y, prob, 0xCC0000);
		} else {
			txt = getProbText(x, y, prob, 0x000000);
			dots = getDots(x, y, prob, 0x000000);
		}
		txt.mouseEnabled = false;
		// stage.addChild(txt);
		sprites.push(txt);
		hex_baggage.push(txt);
		hex_baggage.push(dots)
	}
	if (field != null) {
		field.mouseEnabled = false;
		// stage.addChild(field);
		sprites.push(field);
		hex_baggage.push(field);
	}
	// stage.addChildAt(hex, 0);
	sprites.push(hex);
	hexesToPoints.set(hex, new Point(x, y));
	hexesToColor[hex] = color;
	hexesBaggage[hex] = hex_baggage;
	hexes.push(hex);
}

function getProbText(x, y, prob, color) {
	return svgText(
		x,
		y + ydt / 2 + 8,
		'prob',
		prob,
		{color}
	);
}

function getDots(x, y, prob, color) {
	let dots = [];
	let options = {
		mouseEnabled: false,
		strokeWidth: 0,
	};
	let radius = 4;
	switch (PROBABILITY_MAPPING[prob]) {
		case 5:
			dots.push(svgCircle(x-20, y+ydt/2+25, radius, color, options));
			dots.push(svgCircle(x+20, y+ydt/2+25, radius, color, options));
			// fall through
		case 3:
			dots.push(svgCircle(x-10, y+ydt/2+25, radius, color, options));
			dots.push(svgCircle(x+10, y+ydt/2+25, radius, color, options));
			// fall through
		case 1:
			dots.push(svgCircle(x, y+ydt/2+25, radius, color, options));
			break;
		case 4:
			dots.push(svgCircle(x-15, y+ydt/2+25, radius, color, options));
			dots.push(svgCircle(x+15, y+ydt/2+25, radius, color, options));
			// fall through
		case 2:
			dots.push(svgCircle(x-5, y+ydt/2+25, radius, color, options));
			dots.push(svgCircle(x+5, y+ydt/2+25, radius, color, options));
			break;
		case 0:
		default:
			console.log(`Unexpected prob in getDots: ${prob}`);
	}
	return dots;
}

function nextInt(n) {
	return Math.floor(Math.random()*n);
}

function cleanUp(hideHelpText) {
	if (hideHelpText) {
		helpText.style.visibility = 'hidden';
	}
	svg.innerHTML = '';
	hexesToPoints = new WeakMap();
	hexesToColor = {};
	hexesBaggage = {};
}

function clickLandHex(evt) {
	let p = hexesToPoints.get(evt.currentTarget);
	let color = RESOURCE_CYCLE[hexesToColor[evt.currentTarget]];
	if (hexesToColor[evt.currentTarget] !== DESERT) {
		// stage.removeChild(evt.currentTarget);
		drawHex(p.x, p.y, color, null, null);
	}
	if (map_type === CUSTOM) {
		let realPoint = pointToGridPoint(p);
		if (color === LAND) {
			//console.log("land added: " + realPoint);
			land_grid.push(realPoint);
		}
		if (hexesToColor[evt.currentTarget] === LAND) {
			//console.log("land removed: " + realPoint);
			removePointFromArray(realPoint, land_grid);
		}
		if (color === WATER) {
			//console.log("water added: " + realPoint);
			water_grid.push(realPoint);
		}
		if (hexesToColor[evt.currentTarget] === WATER) {
			//console.log("water removed: " + realPoint);
			removePointFromArray(realPoint, water_grid);
		}
		//console.log("land_len: " + land_grid.length);
		//console.log("water_len: " + water_grid.length);
	}
	return false;
}

function getAllLandNeighbors(arrayOfPoints) {
	let arrayToReturn = [];
	for (let j=0; j < arrayOfPoints.length; j++) {
		let pt = arrayOfPoints[j];
		let arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		let arrayOfNeighbors = [];
		for (let k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (let i=0; i < arrayOfPoints.length; i++) {
				if (arrayOfPoints[i].equals(arrayOfNeighborPoints[k])) {
					arrayOfNeighbors.push(i);
				}
			}
		}
		arrayToReturn.push(arrayOfNeighbors.sort());
	}
	return arrayToReturn;
}

function getAllWaterNeighbors(arrayOfWaterPoints, arrayOfLandPoints) {
	let arrayToReturn = [];
	for (let j=0; j < arrayOfWaterPoints.length; j++) {
		let pt = arrayOfWaterPoints[j];
		let arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		let arrayOfNeighbors = [];
		for (let k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (let i=0; i < arrayOfLandPoints.length; i++) {
				if (arrayOfLandPoints[i].equals(arrayOfNeighborPoints[k])) {
					arrayOfNeighbors.push(i);
				}
			}
		}
		arrayToReturn.push(arrayOfNeighbors.sort());
	}
	return arrayToReturn;
}

function getHarborLinePossibilities(arrayOfWaterPoints, arrayOfLandPoints) {
	let arrayToReturn = [];
	for (let j=0; j < arrayOfWaterPoints.length; j++) {
		let pt = arrayOfWaterPoints[j];
		let arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		let harborLines = {};
		for (let k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (let i=0; i < arrayOfLandPoints.length; i++) {
				if (arrayOfLandPoints[i].equals(arrayOfNeighborPoints[k])) {
					harborLines[k] = true;
					harborLines[(k+1) % 6] = true;
				}
			}
		}
		let arrayOfHarborLines = [];
		for (let m=0; m < 6; m++) {
			if (harborLines[m]) {
				arrayOfHarborLines.push(m);
			}
		}
		arrayToReturn.push(arrayOfHarborLines);
	}
	return arrayToReturn;
}


function getHexNeighbors(x, y) {
	let a = [];
	a.push(new Point(x-1,y-1), new Point(x+1,y-1), new Point(x+2,y),
		   new Point(x+1,y+1), new Point(x-1,y+1), new Point(x-2,y));
	return a;
}

function getIntersections(arrayOfLandPoints, arrayOfNeighbors) {
	let arrayToReturn = [];
	for (let i=0; i < arrayOfNeighbors.length; i++) {
		let setsOfPairs = getEveryPair(arrayOfNeighbors[i]);
		setsOfPairs.forEach((pair) => {
			let point1 = arrayOfLandPoints[pair.x];
			let point2 = arrayOfLandPoints[pair.y];
			let pushArray = [i, pair.x, pair.y];
			if (pointsAreTouching(point1, point2)
				&& !arrayContainsTriplet(arrayToReturn, pushArray)) {
				arrayToReturn.push(pushArray);
			}
		});
	}
	return arrayToReturn;
}

function arrayContainsTriplet(theArray, trip) {
	let tripSort = trip.sort();
	theArray.forEach((arrayTrip) => {
		let arrayTripSort = arrayTrip.sort();
		if (arrayTripSort[0] === tripSort[0]
			&& arrayTripSort[1] === tripSort[1]
			&& arrayTripSort[2] === tripSort[2]) {
			return true;
		}
	});
	return false;
}

function pointsAreTouching(pt1, pt2) {
	return pt1.x + 2 === pt2.x && pt1.y === pt2.y
		|| pt1.x + 1 === pt2.x && pt1.y + 1 === pt2.y
		|| pt1.x - 1 === pt2.x && pt1.y + 1 === pt2.y
		|| pt1.x - 2 === pt2.x && pt1.y === pt2.y
		|| pt1.x - 1 === pt2.x && pt1.y - 1 === pt2.y
		|| pt1.x + 1 === pt2.x && pt1.y - 1 === pt2.y;

}

function getEveryPair(points) {
	let arrayToReturn = [];
	for (let i=0; i < points.length-1; i++) {
		for (let j=i+1; j < points.length; j++) {
			arrayToReturn.push(new Point(points[i], points[j]));
		}
	}
	return arrayToReturn;
}

function getNumberOf(res, resources) {
	let count = 0;
	resources.forEach((ind) => {
		if (ind === res) {
			count++
		}
	})
	return count;
}

function pointToGridPoint(pt) {
	for (let i=0; i<=BOARD_RANGE_Y_VALUE; i++) {
		for (let j=(i%2); j<=BOARD_RANGE_X_VALUE; j+=2) {
			if (the_map[j][i].x === pt.x
				&& the_map[j][i].y === pt.y) {
				return new Point(j, i);
			}
		}
	}
	return null;
}

function removePointFromArray(pt, arr) {
	let tempPt = arr.pop();
	if (pt.x === tempPt.x && pt.y === tempPt.y) {
		return;
	}
	arr.unshift(tempPt);
	tempPt = new Point();
	while (tempPt.x !== pt.x || tempPt.y !== pt.y) {
		tempPt = arr.pop();
		if (pt.x === tempPt.x && pt.y === tempPt.y) {
			return;
		}
		arr.unshift(tempPt);
	}
}


init();
