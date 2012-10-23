/*=====================================================
  Declared as literal object (All variables are static)	  
  =====================================================*/
var Game = {
	HEIGHT : window.innerHeight,				// height of Pong game window
	WIDTH : window.innerWidth,				// width of Pong game window
	PORT : 8000,				
	FRAME_RATE : 25,//30			
	SERVER_NAME : "localhost"	// server name of Pong game
}

// For node.js require
global.Game = Game;


