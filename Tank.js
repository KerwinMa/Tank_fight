function Tank(posX, posZ) { 
	/*=========       Variables       =========*/
	this.x; // x-coordinate of tank's position [Public]     
	this.y; // 	y - coordinate of tank 's position [Public]     
	this.z; //z-coordinate of tank'	s 	position[Public] 
	this.rotationY; //tank's rotation along y axis
	/*===========       Constructor       ===========*/
	this.x = posX;
	this.y = 0;
	this.z = posZ;
	this.rotationY = Math.PI / 2;
	this.health = 100;
	this.cID;

	this.getAngularQuadrant = function() {
		if(((this.rotationY > 0 && this.rotationY < Math.PI / 2) || (this.rotationY < 0 && this.rotationY > -2 * Math.PI && this.rotationY < -1.5 * Math.PI)) || this.rotationY == 0 || this.rotationY == -2 * Math.PI) 
			return 1;
		else if(((this.rotationY > 0 && this.rotationY < Math.PI && this.rotationY > 0.5 * Math.PI) || (this.rotationY < 0 && this.rotationY < -Math.PI && this.rotationY > -1.5 * Math.PI)) || this.rotationY == Math.PI / 2 || this.rotationY == -1.5 * Math.PI) 
			return 2;
		else if(((this.rotationY > 0 && this.rotationY > Math.PI && this.rotationY < 1.5 * Math.PI) || (this.rotationY < 0 && this.rotationY > -Math.PI && this.rotationY < -0.5 * Math.PI)) || this.rotationY == Math.PI || this.rotationY == -Math.PI) 
			return 3;
		else 
			return 4;
	}

	this.getRegionalQuadrant = function() {
		if(this.x >= -800 && this.x <= 0 && this.z >= -800 && this.z <= 0) 
			return 1;
		else if(this.x >= -800 && this.x < 0 && this.z <= 800 && this.z > 0) 
			return 2;
		else if(this.x <= 800 && this.x > 0 && this.z <= 800 && this.z > 0) 
			return 3;
		else 
			return 4;
	}

	this.getCorners = function() {
		var theta1 = Math.abs(Math.atan((-800 - this.x) / (-800 - this.z))); //var theta2 = Math.PI/2 - theta1; 
		var theta2 = Math.abs(Math.atan((-800 - this.x) / (800 - this.z)));
		var theta3 = Math.abs(Math.atan((800 - this.x) / (800 - this.z)));
		var theta4 = Math.abs(Math.atan((800 - this.x) / (-800 - this.z)));

		console.log("theta1 " + theta1*180/Math.PI);
		console.log("theta2 " + theta2*180/Math.PI);
		console.log("theta3 " + theta3*180/Math.PI);
		console.log("theta4 " + theta4*180/Math.PI);

		if((this.rotationY > 0 && (this.rotationY < theta1 || this.rotationY > (2*Math.PI-theta4))) || 
			(this.rotationY < 0 && (this.rotationY > -theta4 || this.rotationY < (-2 * Math.PI + theta1))) || 
			this.rotationY == 0) 
			return 1;
		else if ((this.rotationY > 0 && this.rotationY > theta1 && this.rotationY < (Math.PI - theta2))
			|| (this.rotationY < 0 && this.rotationY > (-2*Math.PI + theta1) &&this.rotationY < (-Math.PI-theta2)))
			return 2;
		else if ((this.rotationY > 0 && this.rotationY > (Math.PI - theta2) && this.rotationY < (Math.PI + theta3)) || 
			(this.rotationY < 0 && this.rotationY > (-Math.PI-theta2)) && this.rotationY < (-Math.PI + theta3))
			return 3;
		else if ((this.rotationY > 0 && this.rotationY > (Math.PI + theta3) && this.rotationY < (2*Math.PI - theta4)) || 
			(this.rotationY < 0 && this.rotationY > (-Math.PI + theta3)) && this.rotationY < (-theta4))
			return 4;
		else 
			return 0;
	}
}

/*================   Static Variables   ================*/
Tank.ScaleX = 30;
Tank.ScaleY = 30;
Tank.ScaleZ = 30;
Tank.Scale = 30;
Tank.tankHalfW = 30;
Tank.tankHalfH = 55;

/*=============   move [Public]   =============*/
Tank.prototype.move = function(newx, newz, rotY) {
	this.x = newx;
	this.z = newz;
	this.rotationY = rotY;
}

// Tank.prototype.endPoint = function() {
// 	console.log(getCorners());
// }

	// For node.js require 
global.Tank = Tank;
