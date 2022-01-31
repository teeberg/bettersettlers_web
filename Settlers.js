// Copyright 2008 Better Settlers Inc.
// Author: aflynn@gmail.com (Andrew Flynn)

var xd:Number = 40;
var xdt:Number = xd*2;
var yd1:Number = 27;
var yd2:Number = 42;
var ydt:Number = yd1+yd2;

const STANDARD:Number = -1;
const LARGE:Number = -2;
const XLARGE:Number = -3;
const CUSTOM:Number = -4;

const SHEEP:Number = 0x00CD00;
const ROCK:Number = 0x808080;
const CLAY:Number = 0x560000;
const WOOD:Number = 0x004B00;
const WATER:Number = 0x0066CC;
const WHEAT:Number = 0xFFFF00;
const DESERT:Number = 0xFFCC32;
const BLANK:Number = 0x111111;
const LAND:Number = 0x939331;

const RESOURCE_CYCLE:Dictionary = new Dictionary();
RESOURCE_CYCLE[SHEEP] = ROCK;
RESOURCE_CYCLE[ROCK] = CLAY;
RESOURCE_CYCLE[CLAY] = WOOD;
RESOURCE_CYCLE[WOOD] = WHEAT
RESOURCE_CYCLE[WHEAT] = SHEEP;

RESOURCE_CYCLE[BLANK] = LAND;
RESOURCE_CYCLE[LAND] = WATER;
RESOURCE_CYCLE[WATER] = BLANK;

const STARTING_X_VALUE:Number = 190;
const STARTING_Y_VALUE:Number = 120;

const BOARD_RANGE_X_VALUE:Number = 14;
const BOARD_RANGE_Y_VALUE:Number = 8;

/**
 * Mapping between the numbers that are shown (rolled on the dice) and the probability of each
 * being rolled.
 */
const PROBABILITY_MAPPING:Array = new Array(
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
    1); // 12

var map_type:Number;
var num_of_sheep:Number;
var num_of_wheat:Number;
var num_of_wood:Number;
var num_of_rock:Number;
var num_of_clay:Number;
var available_probabilities:Array;
var available_resources:Array;
var available_harbors:Array;
var land_grid:Array;
var water_grid:Array;
var harbor_lines:Array;
var land_neighbors:Array;
var water_neighbors:Array;
var land_intersections:Array;

// 2  3  4  5 6
// 12 11 10 9 8
const DEFAULT_AVAILABLE_PROBABILITIES:Array = new Array(
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12,
			5, 11, 9, 3, 10, 4, 8, 2, 6, 12, 5, 11, 9, 3, 10, 4, 8, 2, 6, 12);

const DEFAULT_AVAILABLE_RESOURCES:Array = new Array(
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
			SHEEP, WOOD, WHEAT, CLAY, ROCK, SHEEP, WOOD, WHEAT, CLAY, ROCK, DESERT);

const DEFAULT_AVAILABLE_HARBORS:Array = new Array(
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT,
			DESERT, SHEEP, DESERT, WOOD, WHEAT, DESERT, CLAY, ROCK, DESERT);

const STANDARD_AVAILABLE_PROBABILITIES:Array = new Array( 2, 3, 3,
			4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12 );

const STANDARD_AVAILABLE_RESOURCES:Array = new Array(
			SHEEP, SHEEP, SHEEP, SHEEP,
			WHEAT, WHEAT, WHEAT, WHEAT,
			WOOD, WOOD,	WOOD, WOOD,
			ROCK, ROCK,	ROCK, CLAY,
			CLAY, CLAY,	DESERT);

const STANDARD_AVAILABLE_HARBORS:Array = new Array(
			SHEEP, WHEAT, WOOD, ROCK, CLAY,
			DESERT, DESERT, DESERT,	DESERT);

const STANDARD_LAND_GRID:Array = new Array(new Point(4, 2),
			new Point(6, 2), new Point(8, 2), new Point(3, 3), new Point(5, 3),
			new Point(7, 3), new Point(9, 3), new Point(2, 4), new Point(4, 4),
			new Point(6, 4), new Point(8, 4), new Point(10, 4),
			new Point(3, 5), new Point(5, 5), new Point(7, 5), new Point(9, 5),
			new Point(4, 6), new Point(6, 6), new Point(8, 6));

const STANDARD_WATER_GRID:Array = new Array( new Point(3, 1),
			new Point(5, 1), new Point(7, 1), new Point(9, 1),
			new Point(10, 2), new Point(11, 3), new Point(12, 4),
			new Point(11, 5), new Point(10, 6), new Point(9, 7),
			new Point(7, 7), new Point(5, 7), new Point(3, 7), new Point(2, 6),
			new Point(1, 5), new Point(0, 4), new Point(1, 3), new Point(2, 2));
	
/**
 * LARGE BOARD (5 ppl)
 * List of how many of each probability this type of board contains
 */
const LARGE_AVAILABLE_PROBABILITIES:Array = new Array(2,3,3,4,4,5,5,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12);
	
/**
 * LARGE BOARD (5 ppl)
 * List of how many of each resource this type of board contains
 */
const LARGE_AVAILABLE_RESOURCES:Array = new Array(
		SHEEP, SHEEP, SHEEP, SHEEP, SHEEP,  // 5 Sheep
		WHEAT, WHEAT, WHEAT, WHEAT, WHEAT,  // 5 Wheat
		WOOD, WOOD, WOOD, WOOD, WOOD,   // 5 Wood
		ROCK, ROCK, ROCK, ROCK,   // 4 Rock
		CLAY, CLAY,	CLAY, CLAY,   // 4 Clay
		DESERT); // 1 Desert
	
/**
 * LARGE BOARD (5 ppl)
 * List of how many of harbors there are (desert is 3:1)
 */
const LARGE_AVAILABLE_HARBORS:Array = new Array(
		SHEEP,  // 1 Sheep 2:1
		WHEAT,  // 1 Wheat 2:1
		WOOD,   // 1 Wood 2:1
		ROCK,   // 1 Rock 2:1
		CLAY,   // 1 Clay 2:1
		DESERT, // 5 3:1's
		DESERT,
		DESERT,
		DESERT,
		DESERT);
	
/**
 * LARGE BOARD (5 ppl)
 * The (x,y) pixels of the TL corner of each land hexagon for drawing purposes.
 */
const LARGE_LAND_GRID:Array = new Array(
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
		new Point(10,6));  // 23
	
/**
 * LARGE BOARD (5 ppl)
 * The (x,y) pixels of the TL corner of each ocean hexagon for drawing purposes.
 */
const LARGE_WATER_GRID:Array = new Array(
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
		new Point(2,2));  // 19

/**
 * XLARGE BOARD (6 ppl) List of how many of each probability this type of board contains
 */
const XLARGE_AVAILABLE_PROBABILITIES:Array = new Array(
  2,2,3,3,3,4,4,4,5,5,5,6,6,6,8,8,8,9,9,9,10,10,10,11,11,11,12,12 );

/**
 * XLARGE BOARD (6 ppl) List of how many of each resource this type of board contains
 */
const XLARGE_AVAILABLE_RESOURCES:Array = new Array(
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
			DESERT);

/**
 * XLARGE BOARD (6 ppl) List of how many of harbors there are (desert is 3:1)
 */
const XLARGE_AVAILABLE_HARBORS:Array = new Array(
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
			DESERT);

/**
 * XLARGE BOARD (6 ppl) The (x,y) pixels of the TL corner of each land hexagon for drawing purposes.
 */
const XLARGE_LAND_GRID:Array = new Array(
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
		new Point(9,7)); // 29

/**
 * XLARGE BOARD (6 ppl) The (x,y) pixels of the TL corner of each ocean hexagon for drawing purposes.
 */
const XLARGE_WATER_GRID:Array = new Array(
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
		new Point(3,1)); // 21

var sprites:Array = new Array();
var hexesToPoints:Dictionary = new Dictionary();
var hexesToColor:Dictionary = new Dictionary()
var hexesBaggage:Dictionary = new Dictionary();
var hexes:Array = new Array();
var mouse_is_down:Boolean = false;

var the_map:Array = new Array(BOARD_RANGE_X_VALUE+1);
var resource_map:Array = new Array();
var probability_map:Array = new Array();
var harbor_map:Array = new Array();
var help_text:TextField = new TextField();
var help_text_format:TextFormat = new TextFormat();

generate_map_button.addEventListener(MouseEvent.CLICK, generateMap);
shuffle_probabilities_button.addEventListener(MouseEvent.CLICK, shuffleProbabilities);
shuffle_harbors_button.addEventListener(MouseEvent.CLICK, shuffleHarbors);
standard_radio.addEventListener(MouseEvent.CLICK, shiftToStandard);
large_radio.addEventListener(MouseEvent.CLICK, shiftToLarge);
xlarge_radio.addEventListener(MouseEvent.CLICK, shiftToXlarge);
reset_map_button.addEventListener(MouseEvent.CLICK, resetMap);

/*
var file:FileReference = new FileReference();
upload_file_button.addEventListener(MouseEvent.CLICK, uploadFile);
file.addEventListener(Event.SELECT, selectFile);

var xml_loader:URLLoader = new URLLoader();
xml_loader.addEventListener(Event.COMPLETE, loadCustomMap);

function uploadFile(evt:Event):void {
	//file.browse(new Array(new FileFilter("Maps", "*.map")));
	xml_loader.load(new URLRequest("standard.map"));
}

function loadCustomMap(evt:Event):void {
	var xml:XML = new XML(evt.target.data);
	trace(xml);
}

function selectFile(evt:Event):void {
	file = FileReference(evt.target);
	//trace("File chosen:" + file.name + ", size: " + file.size);
}
*/

/* Start here */
map_type = STANDARD;
available_probabilities = STANDARD_AVAILABLE_PROBABILITIES;
available_resources = STANDARD_AVAILABLE_RESOURCES;
available_harbors = STANDARD_AVAILABLE_HARBORS;
land_grid = STANDARD_LAND_GRID;
water_grid = STANDARD_WATER_GRID;
calculateOthers();
createGlobalMap(false /* showGrid */);
generateMap(null);

function calculateOthers():void {
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

function shiftToStandard(evt:MouseEvent):void {
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

function shiftToLarge(evt:MouseEvent):void {
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

function shiftToXlarge(evt:MouseEvent):void {
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

function resetMap(evt:MouseEvent):void {
	cleanUp(true /* help text */);
	map_type = CUSTOM;
	available_probabilities = new Array();
	available_resources = new Array();
	available_harbors = new Array();
	land_grid = new Array();
	water_grid = new Array();
	calculateOthers();
	createGlobalMap(true /* showGrid */);
	//drawBoard(true /* blank */);
}

function generateMap(evt:MouseEvent):void {
	cleanUp(true /* help text */);
	if (map_type == CUSTOM) {
		var land_len:Number = land_grid.length;
		var water_len:Number = water_grid.length;
		
		if (land_len > 0) {
			available_probabilities = new Array();
			available_resources = new Array();
			available_harbors = new Array();
		
			var l:Number = 0;
			for (l=0; l < land_len; l++) {
				available_probabilities.push(DEFAULT_AVAILABLE_PROBABILITIES[l]);
				available_resources.push(DEFAULT_AVAILABLE_RESOURCES[l]);
			}
			for (var w=0; w < water_grid.length; w+=2) {
				available_harbors.push(DEFAULT_AVAILABLE_HARBORS[w]);
			}
			// Deal with deserts
			for each (var res:Number in available_resources) {
				if (res == DESERT) {
					available_probabilities.pop();
				}
			}
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
function shuffleProbabilities(evt:MouseEvent):void {
	cleanUp(true /* help text */);
	var finding_map:Boolean = true;
	while (finding_map) {
		var probabilities:Dictionary = getProbabilities();

		var counter:Number = 0;
		while (counter < 10000) {
			var temp_probabilities:Dictionary = deepCopy(
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

function shuffleHarbors(evt:MouseEvent):void {
	cleanUp(true /* help text */);
	harbor_map = getHarbors(resource_map, probability_map);
	drawBoard(false  /* blank */);
}

/** Unused */
function showLoadingMap():void {
	for (var i=0; i<land_grid.length; i++) {
		var a:Number = land_grid[i].x;
		var b:Number = land_grid[i].y;
		var pt:Point = new Point();
		pt.x = the_map[a][b].x;
		pt.y = the_map[a][b].y;
		//trace("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		drawHex(pt.x, pt.y, BLANK, null, null);
	}
	for (var j=0; j<water_grid.length; j++) {
		var c:Number = water_grid[j].x;
		var d:Number = water_grid[j].y;
		var pt2:Point = new Point();
		pt2.x = the_map[c][d].x;
		pt2.y = the_map[c][d].y;
		//trace("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		drawHex(pt2.x, pt2.y, WATER, null, null);
	}
}

function generate():void {
	var uber_counter:Number = 0;
	while (uber_counter < 10) {
		resource_map = getBalancedBoard();
		var probabilities:Dictionary = getProbabilities();

		var counter:Number = 0;
		while (counter < 10000) {
			var temp_probabilities:Dictionary = deepCopy(
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

function createGlobalMap(showGrid):void {
	for (var a=0; a<the_map.length; a++) {
		the_map[a] = new Array(BOARD_RANGE_Y_VALUE+1);
	}
	for (var i=0; i<=BOARD_RANGE_Y_VALUE; i++) {
		for (var j=(i%2); j<=BOARD_RANGE_X_VALUE; j+=2) {
			var temp:Point = new Point((xd*j)+STARTING_X_VALUE,
			  (ydt*i)+STARTING_Y_VALUE);
			the_map[j][i] = temp;
			if (showGrid) {
				/*
				var txt:TextField = new TextField();
				var txt_format:TextFormat = new TextFormat();
				txt.text = "(" + j + ", " + i + ")";
				txt_format.color = 0xFFFFFF;
				txt_format.font = "courier new";
				txt_format.size = 20;
				txt_format.bold = true;
				txt_format.align = "center";
				txt.x = temp.x-xdt/2-10;
				txt.y = temp.y+ydt/2-5;
				txt.setTextFormat(txt_format);
				drawHex(temp.x, temp.y, BLANK, null, txt);
				*/
				drawHex(temp.x, temp.y, BLANK, null, null);
			}
		}
	}
	if (showGrid) {
		help_text = new TextField();
		help_text_format = new TextFormat();
		help_text.text = "Click a hex once for land and twice for ocean.\n"
		               + "Click 'Generate Map' when done for a fair map!";
		help_text_format.color = 0x000000;
		help_text_format.font = "courier new";
		help_text_format.size = 16;
		help_text_format.bold = true;
		help_text.autoSize = TextFieldAutoSize.LEFT;
		help_text.x = 125;
		help_text.y = 60;
		help_text.setTextFormat(help_text_format);
		stage.addChild(help_text);
	}
}

function getBalancedBoard():Array {
	var set:Array = new Array();
	var tried:Array = new Array();
	var avail:Array = initAvail();
	var refill_avail:Boolean = false;
	
	var c:Number = 0;

	while (tried.length!=0 || avail.length!=0) {
		if (refill_avail) {
			avail = avail.concat(tried);
			tried = new Array();
		}
		if (avail.length == 0) {
			set = new Array();
			tried = new Array();
			avail = initAvail();
		} else {
			// Reshuffle a random number of them
			var rand:Number = nextInt(avail.length);
			for (var i=0; i<rand; i++) {
				avail.push(avail.shift());
			}
			var resource:Number = avail.pop();
			
			var next_index:Number = set.length;
			var can_place_here:Boolean = true;
			for each (var neighbor:Number in
	          land_neighbors[next_index]) {
				if (neighbor > set.length) {
					// Do nothing, it isn't occupied yet
				} else {
					if (set[neighbor] == resource) {
						can_place_here = false;
						break;
					} else {
						// Do nothing, this neighbor isn't the same
					}
				}
			}
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
function initAvail():Array {
	var avail:Array = new Array();
	for each (var resource:Number in available_resources) {
		avail.push(resource);
	}
	return avail;
}

function getProbabilities():Dictionary {
	var probs:Dictionary = new Dictionary();
	var numbers:Array = initProbabilities();
	var sheeps:Array = new Array();
	var woods:Array = new Array();
	var rocks:Array = new Array();
	var clays:Array = new Array();
	var wheats:Array = new Array();
	
	while (true) {
		numbers = initProbabilities();
		sheeps = new Array();
		woods = new Array();
		rocks = new Array();
		clays = new Array();
		wheats = new Array();
		
		// Assign numbers completely randomly to each resource
		while (numbers.length != 0) {
			// Reshuffle a random number of them
			var rand:Number = nextInt(numbers.length);
			for (var i=0; i<rand; i++) {
				numbers.push(numbers.shift());
			}
			
			if (sheeps.length < num_of_sheep) {
				sheeps.push(numbers.pop());
				continue;
			}
			if (woods.length < num_of_wood) {
				woods.push(numbers.pop());
				continue;
			}
			if (wheats.length < num_of_wheat) {
				wheats.push(numbers.pop());
				continue;
			}
			if (rocks.length < num_of_rock) {
				rocks.push(numbers.pop());
				continue;
			}
			if (clays.length < num_of_clay) {
				clays.push(numbers.pop());
				continue;
			}
		}
		
		// Try out to see if a) any resource has two of the same numbers or
		// b) the probability of a single resource is too high or low or
		// c) within each resource, no one tile has more than half the probability
		//
		// This is different per the size of the map
		var magic_low;
		var magic_high;
		var tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
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
function initProbabilities():Array {
	var numbers:Array = new Array();
	for each (var prob:Number in available_probabilities) {
		numbers.push(prob);
	}
	return numbers;
}

function noDuplicates(numbers):Boolean {
	var num_found:Number = 0;
	var len:Number = numbers.length;
	
	while (len > 0) {
		var num:Number = numbers.pop();
		len--;
		if (numbers.indexOf(num) != -1) {
			num_found++;
		}
		numbers.unshift(num);
	}
	var tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
	if (tot > 30) {
		return true;
	}
	return (num_found == 0);
}

function isBalanced(numbers):Boolean {
	var len:Number = numbers.length;
	// If we have less than 3, return true automatically
	if (len < 3) {
		return true;
	}
	while (len > 0) {
		var num:Number = numbers.shift();
		len--;
		if (PROBABILITY_MAPPING[num] > sumProbability(numbers)) {
			return false;
		}
		numbers.unshift(num);
	}
	return true;
}

function sumProbability(numbers):Number {
	var sum:Number = 0;
	for each (var num:Number in numbers) {
		sum += PROBABILITY_MAPPING[num];
	}
	return sum;
}

function deepCopy(dict):Dictionary {
	var new_dict:Dictionary = new Dictionary();
	for (var resource:* in dict) {
		var copy:Array = new Array();
		for each (var prob:Number in dict[resource]) {
			copy.push(prob);
		}
		new_dict[resource] = copy;
	}
	return new_dict;
}

function getNumberedBoard(resources, probabilities):Array {
	var probabilities_map:Array = new Array();
	for each (var resource:Number in resources) {
		if (resource == DESERT) {
			probabilities_map.push(resource);
		} else {
			var res_probs:Array = probabilities[resource];
			// Reshuffle a random number of them
			var rand:Number = nextInt(res_probs.length);
			for (var i=0; i<rand; i++) {
				res_probs.push(res_probs.shift());
			}
			probabilities_map.push(res_probs.pop());
		}
	}
	return probabilities_map;
}

function checkCollisionsAndProbability(probabilities):Boolean {
	for each (var triplet:Array in land_intersections) {
		var temp_triplets:Array = new Array();
		for each (var trip:Number in triplet) {
			temp_triplets.push(probabilities[trip]);
		}
		if (!noDuplicates(temp_triplets)) {
			return false;
		} else {
			var tot = num_of_sheep + num_of_wood + num_of_clay + num_of_rock + num_of_wheat;
			if (tot > 30) {
				return true;
			}
			if (temp_triplets.indexOf(0) != -1) {
				if (map_type == STANDARD) {
					// Has a desert: x < 8
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				} else if (map_type == LARGE) {
					// Has a desert: x < 9
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				} else if (map_type == XLARGE || map_type == CUSTOM) {
					// Has two deserts: x < 10
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 8) {
						return false;
					}
				}
			} else {
				if (map_type == STANDARD) {
					// Prob: x < 11
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				} else if (map_type == LARGE) {
					// Prob: x < 12
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				} else if (map_type == XLARGE || map_type == CUSTOM) {
					// Prob: x < 13
					if (sumProbability(temp_triplets) < 0 ||
						sumProbability(temp_triplets) > 11) {
						return false;
					}
				}
			}
		}
	}
	return true;
}

function getHarbors(resources, probabilities):Array {
	var harbors:Array = new Array();
	var left:Array = new Array();
	
	while (true) {
		left = initHarbors();
		harbors = new Array();
		
		// Quick coin-flip to see if we start with a harbor or open ocean
		if (nextInt(2) != 0) {
			while (left.length != 0 && harbors.length < water_grid.length) {
				// Reshuffle a random number of them
				var rand:Number = nextInt(left.length);
				for (var r1=0; r1<rand; r1++) {
					left.push(left.shift());
				}
				
				if (harbors.length < water_grid.length) {
					var tmp_array:Array = new Array();
					tmp_array[0] = left.pop();
					harbors.push(tmp_array);
				}
				if (harbors.length < water_grid.length) {
					var tmp_array_b:Array = new Array();
					tmp_array_b[0] = WATER;
					harbors.push(tmp_array_b);
				}
			}
		} else {
			while (left.length != 0 && harbors.length < water_grid.length) {
				// Reshuffle a random number of them
				rand = nextInt(left.length);
				for (var r2=0; r2<rand; r2++) {
					left.push(left.shift());
				}
				
				if (harbors.length < water_grid.length) {
					var tmp_array_2b:Array = new Array();
					tmp_array_2b[0] = WATER;
					harbors.push(tmp_array_2b);
				}
				if (harbors.length < water_grid.length) {
					var tmp_array2:Array = new Array();
					tmp_array2[0] = left.pop();
					harbors.push(tmp_array2);
				}
			}
		}
		
		// Fill the rest with water
		while (harbors.length < water_grid.length) {
			var tmps:Array = new Array();
			tmps[0] = WATER;
			harbors.push(tmps);
		}
		
		// Check to see if things are fair
		var fair:Boolean = true;
		for (var i=0; i<harbors.length; i++) {
			if (harbors[i][0] == DESERT || harbors[i][0] == WATER) {
				continue;
			} else {
				var facing:Array = water_neighbors[i];
				for each (var land_ind:Number in facing) {
					var land_prob:Number = probabilities[land_ind];
					var land_res:Number = resources[land_ind];
					if (land_res == harbors[i][0] && land_prob >=5
						&& land_prob <=9) {
						fair = false;
						break;
					}
				}
			}
		}
		if (fair) {
			// Position harbors
			for (var j=0; j<harbors.length; j++) {
				var len:Number = harbor_lines[j].length;
				var ran:Number = nextInt(len);
				harbors[j][1] = harbor_lines[j][ran];
				harbors[j][2] = nextGoodHarborLine(harbor_lines[j], ran);
			}
			break;
		}
	}
	return harbors;
}

function nextGoodHarborLine(lines, seed):Number {
	for (var i=0; i < lines.length; i++) {
		var cand:Number = lines[i];
		if (1 == Math.abs(lines[seed] - lines[i])
			|| 5 == Math.abs(lines[seed] - lines[i])) {
			return cand;
		}
	}
	return -1;
}

function initHarbors():Array {
	var new_harbors:Array = new Array();
	for each (var res:Number in available_harbors) {
		new_harbors.push(res);
	}
	return new_harbors;
}

function drawBoard(blank):void {
	for (var i=0; i<land_grid.length; i++) {
		var a:Number = land_grid[i].x;
		var b:Number = land_grid[i].y;
		var pt:Point = new Point();
		pt.x = the_map[a][b].x;
		pt.y = the_map[a][b].y;
		//trace("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		if (blank) {
			drawHex(pt.x, pt.y, BLANK /* gray */, null, null);
		} else if (resource_map[i] == DESERT) {
			drawHex(pt.x, pt.y, resource_map[i], null, null);
		} else {
			var prob:Number = probability_map[i];
			drawHex(pt.x, pt.y, resource_map[i], prob, null);
		}
	}
	for (var j=0; j<water_grid.length; j++) {
		var c:Number = water_grid[j].x;
		var d:Number = water_grid[j].y;
		var pt2:Point = new Point();
		pt2.x = the_map[c][d].x;
		pt2.y = the_map[c][d].y;
		//trace("a: " + a + " b: " + b + " x: " + pt.x + " y: " + pt.y);
		if (blank) {
			var tmp_harbor_map:Array = new Array();
			tmp_harbor_map[0] = WATER;
			drawWaterHex(pt2.x, pt2.y, tmp_harbor_map);
		} else {
			drawWaterHex(pt2.x, pt2.y, harbor_map[j]);
		}
	}
}

function drawWaterHex(x, y, harbor_point):void {
	var hex:Sprite = new Sprite();
	hex.graphics.lineStyle(2, 0xFFFFFF);
	hex.graphics.beginFill(WATER);
	hex.graphics.moveTo(x, y);
	hex.graphics.lineTo(x+xd, y+yd1);
	hex.graphics.lineTo(x+xd, y+yd1+yd2);
	hex.graphics.lineTo(x, y+yd1+yd2+yd1);
	hex.graphics.lineTo(x-xd, y+yd1+yd2);
	hex.graphics.lineTo(x-xd, y+yd1);
	hex.graphics.lineTo(x, y);
	//hex.addEventListener(MouseEvent.MOUSE_DOWN, dragDown);
	//hex.addEventListener(MouseEvent.MOUSE_UP, dragUp);
	//hex.addEventListener(MouseEvent.CLICK, clickHex);
	//hex.addEventListener(MouseEvent.ROLL_OVER, rollOverHex);
	var hex_baggage:Array = new Array();
	if (harbor_point[0] != WATER) {
		var harbor:Sprite = getHarborLines(x, y, harbor_point);
		var txt:TextField = getHarborNumber(x, y, harbor_point[0]);
		harbor.mouseEnabled = false;
		txt.mouseEnabled = false;
		stage.addChild(harbor);
		stage.addChild(txt);
		sprites.push(harbor);
		sprites.push(txt);
		hex_baggage.push(harbor);
		hex_baggage.push(txt);
	}
	stage.addChildAt(hex, 0);
	sprites.push(hex);
	hexesToPoints[hex] = new Point(x, y);
	hexesToColor[hex] = harbor_point[0];
	hexesBaggage[hex] = hex_baggage;
	hexes.push(hex);
}

function getHarborLines(x, y, harbor_point):Sprite {
	var h1:Sprite = new Sprite();
	var color:Number = harbor_point[0];
	var dirs:Array;
	if (color == WATER) {
		dirs = null;
	} else {
		dirs = new Array(harbor_point[1], harbor_point[2]);
	}
	if (color == DESERT) {
		color = 0xFFFFFF;
	}
	
	h1.graphics.lineStyle(4, color);
	h1.graphics.beginFill(color);

	for each (var dir:Number in dirs) {
		h1.graphics.moveTo(x, y+yd1+yd2/2);
		switch (dir) {
			case 0:
				h1.graphics.lineTo(x-xd+4, y+yd1+4);
				break;
			case 1:
				h1.graphics.lineTo(x, y+4);
				break;
			case 2:
				h1.graphics.lineTo(x+xd-4, y+yd1+4);
				break;
			case 3:
				h1.graphics.lineTo(x+xd-4, y+yd1+yd2-4);
				break;
			case 4:
				h1.graphics.lineTo(x, y+yd1*2+yd2-4);
				break;
			case 5:
				h1.graphics.lineTo(x-xd+4, y+yd1+yd2-4);
				break;
			default:
		}
	}
	h1.graphics.drawCircle(x, y+yd1+yd2/2, 15);
	return h1;
}

function getHarborNumber(x, y, color):TextField {
	var txt:TextField;
	if (color == DESERT) {
		txt = getProb(x, y+8, 3, 0x000000);
	} else {
		txt = getProb(x, y+8, 2, 0x000000);
	}
	txt.mouseEnabled = false;
	return txt;
}

function drawHex(x, y, color, prob, field):void {
	var hex:Sprite = new Sprite();
	hex.graphics.lineStyle(2, 0xFFFFFF);
	hex.graphics.beginFill(color);
	hex.graphics.moveTo(x, y);
	hex.graphics.lineTo(x+xd, y+yd1);
	hex.graphics.lineTo(x+xd, y+yd1+yd2);
	hex.graphics.lineTo(x, y+yd1+yd2+yd1);
	hex.graphics.lineTo(x-xd, y+yd1+yd2);
	hex.graphics.lineTo(x-xd, y+yd1);
	hex.graphics.lineTo(x, y);
	//hex.addEventListener(MouseEvent.MOUSE_DOWN, pressDown);
	//hex.addEventListener(MouseEvent.MOUSE_UP, dragUp);
	hex.addEventListener(MouseEvent.CLICK, clickLandHex);
	//hex.addEventListener(MouseEvent.MOUSE_OVER, rollOverHex);
	var hex_baggage:Array = new Array();
	if (prob != null) {
		var txt:TextField;
		var dots:Sprite;
		if (prob == 6 || prob == 8) {
			txt = getProb(x, y, prob, 0xCC0000);
			dots = getDots(x, y, prob, 0xCC0000);
		} else {
			txt = getProb(x, y, prob, 0x000000);
			dots = getDots(x, y, prob, 0x000000);			
		}
		txt.mouseEnabled = false;
		stage.addChild(txt);
		sprites.push(txt);
		hex_baggage.push(txt);
		dots.mouseEnabled = false;
		stage.addChild(dots);
		sprites.push(dots);
		hex_baggage.push(dots);
	}
	if (field != null) {
		field.mouseEnabled = false;
		stage.addChild(field);
		sprites.push(field);
		hex_baggage.push(field);
	}
	stage.addChildAt(hex, 0);
	sprites.push(hex);
	hexesToPoints[hex] = new Point(x, y);
	hexesToColor[hex] = color;
	hexesBaggage[hex] = hex_baggage;
	hexes.push(hex);
}

function getProb(x, y, prob, color):TextField {
	var txt:TextField = new TextField();
	var txt_format:TextFormat = new TextFormat();
	txt.text = prob;
	txt_format.color = color;
	txt_format.font = "courier new";
	txt_format.size = 20;
	txt_format.bold = true;
	txt_format.align = "center";
	txt.x = x-xdt/2-10;
	txt.y = y+ydt/2-5;
	txt.setTextFormat(txt_format);
	return txt;
}

function getDots(x, y, prob, color):Sprite {
	var dotMaster:Sprite = new Sprite();
	switch (PROBABILITY_MAPPING[prob]) {
		case 5:
			var dot5L:Sprite = new Sprite();
			dot5L.graphics.beginFill(color);
			dot5L.graphics.drawCircle(x-20, y+ydt/2+25, 3);
			dotMaster.addChild(dot5L);
			var dot5R:Sprite = new Sprite();
			dot5R.graphics.beginFill(color);
			dot5R.graphics.drawCircle(x+20, y+ydt/2+25, 3);
			dotMaster.addChild(dot5R);
		case 3:
			var dot3L:Sprite = new Sprite();
			dot3L.graphics.beginFill(color);
			dot3L.graphics.drawCircle(x-10, y+ydt/2+25, 3);
			dotMaster.addChild(dot3L);
			var dot3R:Sprite = new Sprite();
			dot3R.graphics.beginFill(color);
			dot3R.graphics.drawCircle(x+10, y+ydt/2+25, 3);
			dotMaster.addChild(dot3R);
		case 1:
			var dot1:Sprite = new Sprite();
			dot1.graphics.beginFill(color);
			dot1.graphics.drawCircle(x, y+ydt/2+25, 3);
			dotMaster.addChild(dot1);
			break;
		case 4:
			var dot4L:Sprite = new Sprite();
			dot4L.graphics.beginFill(color);
			dot4L.graphics.drawCircle(x-15, y+ydt/2+25, 3);
			dotMaster.addChild(dot4L);
			var dot4R:Sprite = new Sprite();
			dot4R.graphics.beginFill(color);
			dot4R.graphics.drawCircle(x+15, y+ydt/2+25, 3);
			dotMaster.addChild(dot4R);
		case 2:
			var dot2L:Sprite = new Sprite();
			dot2L.graphics.beginFill(color);
			dot2L.graphics.drawCircle(x-5, y+ydt/2+25, 3);
			dotMaster.addChild(dot2L);
			var dot2R:Sprite = new Sprite();
			dot2R.graphics.beginFill(color);
			dot2R.graphics.drawCircle(x+5, y+ydt/2+25, 3);
			dotMaster.addChild(dot2R);
			break;
		case 0:
		default:
	}
	return dotMaster;
}

function nextInt(n):Number {
	return Math.floor(Math.random()*n);
}

function cleanUp(help):void {
	if (help && stage.contains(help_text)) {
		stage.removeChild(help_text);
	}
	while (sprites.length > 0) {
		var tmp_sprite:DisplayObject = sprites.pop();
		if (stage.contains(tmp_sprite)) {
			stage.removeChild(tmp_sprite);
		}
	}
	hexesToPoints = new Dictionary();
	hexesToColor = new Dictionary();
	hexesBaggage = new Dictionary();
}

function turnHexGray(evt:MouseEvent):void {
	var ct1:ColorTransform = new ColorTransform();
	ct1.color = BLANK;
	evt.currentTarget.transform.colorTransform = ct1;
	trace("LocalX: " + evt.localX + " LocalY: " + evt.localY);
}

function dragDown(evt:MouseEvent):void {
	evt.currentTarget.startDrag();
	var p = hexesToPoints[evt.currentTarget];
	trace("Nearest x: " + p.x + ", y: " + p.y);
}

function pressDown(evt:MouseEvent):void {
	clickLandHex(evt);
	mouse_is_down = true;
}

function dragUp(evt:MouseEvent):void {
	evt.currentTarget.stopDrag();
	var objs:Array = stage.getObjectsUnderPoint(
	    new Point(evt.localX, evt.localY));
	for (var i=0; i<objs.length; i++) {
		if (stage.contains(objs[i])) {
			stage.removeChild(objs[i]);
		}
	}
	//trace("Nearest x: " + p.x + ", y: " + p.y);
}

function clickLandHex(evt:MouseEvent):void {
	var p:Point = hexesToPoints[evt.currentTarget];
	var color:Number = RESOURCE_CYCLE[hexesToColor[evt.currentTarget]];
	if (hexesToColor[evt.currentTarget] != DESERT) {
		stage.removeChild(evt.currentTarget as Sprite);
		drawHex(p.x, p.y, color, null, null);
	}
	if (map_type == CUSTOM) {
		var realPoint:Point = pointToGridPoint(p);
		if (color == LAND) {
			//trace("land added: " + realPoint);
			land_grid.push(realPoint);
		}
		if (hexesToColor[evt.currentTarget] == LAND) {
			//trace("land removed: " + realPoint);
			removePointFromArray(realPoint, land_grid);
		}
		if (color == WATER) {
			//trace("water added: " + realPoint);
			water_grid.push(realPoint);
		}
		if (hexesToColor[evt.currentTarget] == WATER) {
			//trace("water removed: " + realPoint);
			removePointFromArray(realPoint, water_grid);
		}
		//trace("land_len: " + land_grid.length);
		//trace("water_len: " + water_grid.length);
	}
}

function rollOverHex(evt:MouseEvent):void {
	if (evt.buttonDown) {
		clickLandHex(evt);
	}
	trace("Touched!");
}

function getAllLandNeighbors(arrayOfPoints:Array):Array {
	var arrayToReturn:Array = new Array();
	for (var j=0; j < arrayOfPoints.length; j++) {
		var pt:Point = arrayOfPoints[j];
		var arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		var arrayOfNeighbors = new Array();
		for (var k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (var i=0; i < arrayOfPoints.length; i++) {
				if (arrayOfPoints[i].equals(arrayOfNeighborPoints[k])) {
					arrayOfNeighbors.push(i);
				}
			}
		}
		arrayToReturn.push(arrayOfNeighbors.sort());
	}
	return arrayToReturn;
}

function getAllWaterNeighbors(arrayOfWaterPoints:Array, arrayOfLandPoints):Array {
	var arrayToReturn:Array = new Array();
	for (var j=0; j < arrayOfWaterPoints.length; j++) {
		var pt:Point = arrayOfWaterPoints[j];
		var arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		var arrayOfNeighbors = new Array();
		for (var k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (var i=0; i < arrayOfLandPoints.length; i++) {
				if (arrayOfLandPoints[i].equals(arrayOfNeighborPoints[k])) {
					arrayOfNeighbors.push(i);
				}
			}
		}
		arrayToReturn.push(arrayOfNeighbors.sort());
	}
	return arrayToReturn;
}

function getHarborLinePossibilities(arrayOfWaterPoints:Array, arrayOfLandPoints):Array {
	var arrayToReturn:Array = new Array();
	for (var j=0; j < arrayOfWaterPoints.length; j++) {
		var pt:Point = arrayOfWaterPoints[j];
		var arrayOfNeighborPoints = getHexNeighbors(pt.x, pt.y);
		var harborLines:Dictionary = new Dictionary();
		for (var k=0; k < arrayOfNeighborPoints.length; k++ ){
			for (var i=0; i < arrayOfLandPoints.length; i++) {
				if (arrayOfLandPoints[i].equals(arrayOfNeighborPoints[k])) {
					harborLines[k] = true;
					harborLines[(k+1) % 6] = true;
				}
			}
		}
		var arrayOfHarborLines:Array = new Array();
		for (var m=0; m < 6; m++) {
			if (harborLines[m]) {
				arrayOfHarborLines.push(m);
			}
		}
		arrayToReturn.push(arrayOfHarborLines);
	}
	return arrayToReturn;
}


function getHexNeighbors(x, y):Array {
	var a:Array = new Array();
	a.push(new Point(x-1,y-1), new Point(x+1,y-1), new Point(x+2,y),
		   new Point(x+1,y+1), new Point(x-1,y+1), new Point(x-2,y));
	return a;
}

function getIntersections(arrayOfLandPoints, arrayOfNeighbors):Array {
	var arrayToReturn:Array = new Array();
	for (var i=0; i < arrayOfNeighbors.length; i++) {
		var setsOfPairs:Array = getEveryPair(arrayOfNeighbors[i]);
		for each (var pair:Point in setsOfPairs) {
			var point1:Point = arrayOfLandPoints[pair.x];
			var point2:Point = arrayOfLandPoints[pair.y];
			var pushArray:Array = new Array(i, pair.x, pair.y);
			if (pointsAreTouching(point1, point2)
				&& !arrayContainsTriplet(arrayToReturn, pushArray)) {
				arrayToReturn.push(pushArray);
			}
		}
	}
	return arrayToReturn;
}

function arrayContainsTriplet(theArray, trip):Boolean {
	var tripSort:Array = trip.sort();
	for each (var arrayTrip:Array in theArray) {
		var arrayTripSort:Array = arrayTrip.sort();
		if (arrayTripSort[0] == tripSort[0]
			&& arrayTripSort[1] == tripSort[1]
			&& arrayTripSort[2] == tripSort[2]) {
			return true;
		}
	}
	return false;
}

function pointsAreTouching(pt1, pt2):Boolean {
	if (pt1.x+2 == pt2.x && pt1.y == pt2.y
		|| pt1.x+1 == pt2.x && pt1.y+1 == pt2.y
		|| pt1.x-1 == pt2.x && pt1.y+1 == pt2.y
		|| pt1.x-2 == pt2.x && pt1.y == pt2.y
		|| pt1.x-1 == pt2.x && pt1.y-1 == pt2.y
		|| pt1.x+1 == pt2.x && pt1.y-1 == pt2.y) {
		return true;
	}
	return false;
}

function getEveryPair(points):Array {
	var arrayToReturn:Array = new Array();
	for (var i=0; i < points.length-1; i++) {
		for (var j=i+1; j < points.length; j++) {
			arrayToReturn.push(new Point(points[i], points[j]));
		}
	}
	return arrayToReturn;
}

function getNumberOf(res, resources):Number {
	var count:Number = 0;
	for each (var ind:Number in resources) {
		if (ind == res) {
			count++
		}
	}
	return count;
}

function pointToGridPoint(pt):Point {
	for (var i=0; i<=BOARD_RANGE_Y_VALUE; i++) {
		for (var j=(i%2); j<=BOARD_RANGE_X_VALUE; j+=2) {
			if (the_map[j][i].x == pt.x
				&& the_map[j][i].y == pt.y) {
				return new Point(j, i);
			}
		}
	}
	return null;
}

function removePointFromArray(pt, arr):void {
	var tempPt:Point = arr.pop();
	if (pt.x == tempPt.x && pt.y == tempPt.y) {
		return;
	}
	arr.unshift(tempPt);
	tempPt = new Point();
	while (tempPt.x != pt.x || tempPt.y != pt.y) {
		tempPt = arr.pop();
		if (pt.x == tempPt.x && pt.y == tempPt.y) {
			return;
		}
		arr.unshift(tempPt);
	}
}
