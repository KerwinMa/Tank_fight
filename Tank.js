function Tank(posX, posY, posZ){
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
	this.y = posY;
	this.z = posZ;
	this.rotationY = Math.PI/2;
}

/*================
  Static Variables
  ================*/
  Tank.ScaleX = 30;
  Tank.ScaleY = 30;
  Tank.ScaleZ = 30;

/*=============
  move [Public]
  =============*/
/*Tank.prototype.move = function(newx) {
	if (newx < Paddle.WIDTH/2)
		this.x = Paddle.WIDTH/2;
	else if (newx > Pong.WIDTH - Paddle.WIDTH/2)
		this.x = Pong.WIDTH - Paddle.WIDTH/2;
	else
		this.x = newx;
}*/

// For node.js require
global.Tank = Tank;