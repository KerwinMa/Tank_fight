function Player(sid, pid, xPos, yPos, zPos) {
    /*=========
	  Variables
	  =========*/
	this.sid;		// Socket id. Used to uniquely identify players via the socket they are connected from [Public]
    this.pid;		// Player id. Between 1 and 4 [Public]
    this.tank;	// player's tank object [Public]
    var delay;		// player's delay [Private]

    /*===========
	  Constructor
	  ===========*/
    this.sid = sid;
    this.pid = pid;
    this.tank = new Tank(xPos, yPos, zPos);
    var delay = 0;

    this.setDelay = function(newDelay) {
    	delay = newDelay;
    }

    /*
    	Return 0 if no delay
    	Else, return a value between:
    	delay * (1 - errorPercentage%) to delay * (1 + errorPercentage%)
    	Note: Math.random() returns a value between 0 to 1
    */
    this.getDelay = function() {
		var errorPercentage = 20;
	    var lowerbound = delay * (1 - errorPercentage/100);
	    var range = delay * (2 * errorPercentage/100);
		if (delay != 0) {
				return lowerbound + Math.floor(Math.random() * range);
		}
		else 
				return 0
	}
}

// For node.js require
global.Player = Player;
