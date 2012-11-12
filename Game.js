/*=====================================================
  Declared as literal object (All variables are static)	  
  =====================================================*/
var Game = {
	HEIGHT : 500,//window.innerHeight,				// height of Pong game window
	WIDTH :500, // window.innerWidth,				// width of Pong game window
	PORT : 8080,				
	FRAME_RATE : 60,//30			
	SERVER_NAME : "localhost"	// server name of Pong game
}

// For node.js require
global.Game = Game;
