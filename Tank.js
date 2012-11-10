function Tank(posX, posZ){
	/*=========
	  Variables
	  =========*/
	this.x;		// x-coordinate of tank's position [Public]
	this.y;		// y-coordinate of tank's position [Public]
	this.z; 	//z-coordinate of tank's position [Public]
	this.rotationY; //tank's rotation along y axis

	/*===========
	  Constructor
	  ===========*/
	this.x = posX;
	this.y = 0;
	this.z = posZ;
	this.rotationY = Math.PI/2;
}

/*================
  Static Variables
  ================*/
  Tank.ScaleX = 30;
  Tank.ScaleY = 30;
  Tank.ScaleZ = 30;
  Tank.Scale = 30;
  
/*=============
  move [Public]
  =============*/
Tank.prototype.move = function(newx, newz, rotY) {
	this.x = newx;
	this.z = newz;
	this.rotationY = rotY;
}

// For node.js require
global.Tank = Tank;