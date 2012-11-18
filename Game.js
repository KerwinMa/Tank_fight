/*=====================================================
  Declared as literal object (All variables are static)	  
  =====================================================*/
var Game = {
	HEIGHT: 500,
	WIDTH: 500,
	PORT: 8081,
	FRAME_RATE: 60,	//30	
	SERVER_NAME: "localhost"

	//SERVER_NAME: "ec2-175-41-154-33.ap-southeast-1.compute.amazonaws.com" 
}

// For node.js require
global.Game = Game;