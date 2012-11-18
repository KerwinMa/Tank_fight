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
	this.prevTankVx=0;
	this.currTankVx=0;
	this.prevPosX=0;
	this.prevPosZ=0;
	this.dT = 0;

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
		var theta1 = Math.abs(Math.atan((-800 - this.x) / (-800 - this.z)));  
		var theta2 = Math.abs(Math.atan((-800 - this.x) / (800 - this.z)));
		var theta3 = Math.abs(Math.atan((800 - this.x) / (800 - this.z)));
		var theta4 = Math.abs(Math.atan((800 - this.x) / (-800 - this.z)));

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
	this.prevPosX = this.x;
	this.prevPosZ = this.z;
	this.x = newx;
	this.z = newz;
	this.rotationY = rotY;
	this.currTankVx = (this.x - this.prevPosX)*1000/60;
	this.currTankVz = (this.z - this.prevPosZ)*1000/60;
}

Tank.prototype.endPoint = function(time) {
	var corner = this.getCorners();
	var angQuad = this.getAngularQuadrant();
	var endZ;
	var endX;
	if(corner===1){
		endZ = -800;
		if(Math.abs(this.rotationY%2*Math.PI) <1) {
			endX = this.x;
		} else if(angQuad===1){
			var heightX = Math.abs(-800-this.z)*Math.tan(this.rotationY);
			endX = this.x - heightX;
		} else if (angQuad===4) {
			var heightX = Math.abs(-800-this.z)*Math.tan(2*Math.PI-this.rotationY);
			endX = this.x + heightX;
		} else {
			console.log("error in calculating endpoint!");
		}
	} else if(corner===2){
		endX = -800;
		if(Math.abs(this.rotationY + 1.5*Math.PI) <1 || Math.abs(this.rotationY - Math.PI/2) <1){
			endZ = this.z;
		} else if(angQuad===1){
			var heightZ = Math.abs(-800-this.x)/Math.tan(this.rotationY);
			endZ = this.z - heightZ;
		} else if (angQuad===2) {
			var heightZ = Math.abs(-800-this.x)/Math.tan(Math.PI-this.rotationY);
			endZ = this.z + heightZ;
		} else {
			console.log("error in calculating endpoint!");
		}
	} else if (corner===3){
		endZ = 800;
		if(Math.abs(Math.abs(this.rotationY) - Math.PI) < 1) {
			endX = this.x;
		} else if(angQuad===2){
			var heightX = Math.abs(800-this.z)*Math.tan(Math.PI-this.rotationY);
			endX = this.x - heightX;
		} else if (angQuad===3) {
			var heightX = Math.abs(800-this.z)*Math.tan(this.rotationY-Math.PI);
			endX = this.x + heightX;
		} else {
			console.log("error in calculating endpoint!");
		}
	} else if (corner===4){
		endX = 800;
		// console.log(this.rotationY + " z =" + this.z);
		// console.log(Math.abs(this.rotationY - 1.5*Math.PI)*180/Math.PI);
		if(Math.abs(this.rotationY - 1.5*Math.PI)*180/Math.PI < 1 || Math.abs(this.rotationY + Math.PI/2)*180/Math.PI < 1){
			endZ = this.z;
		} else if(angQuad===3){
			var heightZ = Math.abs(800-this.x)/Math.tan(1.5*Math.PI - this.rotationY);
			endZ = this.z + heightZ;
		} else if (angQuad===4) {
			var heightZ = Math.abs(800-this.x)/Math.tan(this.rotationY-1.5*Math.PI);
			endZ = this.z - heightZ;
		} else {
			console.log("error in calculating endpoint!");
		}
	} else {
		if(angQuad===1) {
			endX = -800;
			endZ = -800;
		} else if(angQuad===2) {
			endX = -800;
			endZ = 800;
		} else if(angQuad===3) {
			endX = 800;
			endZ = 800;
		} else {
			endX = 800;
			endZ = -800;
		}
	}

	//console.log("end points: " + endX + ", " + endZ);
	var vx = Math.sin(this.rotationY%(2*Math.PI))*(-7);
	var vz = (-7)*Math.cos(this.rotationY%(2*Math.PI));
	//console.log(Math.floor(vx) + " " + Math.ceil(vz) + " predvelocity ");
	var stepX = Math.ceil((endX - this.x)/vx);
	var stepZ = Math.ceil((endZ - this.z)/vz);
	
	var predTime = 0;

	if(Math.floor(vx)==0||Math.floor(vx)==-1) {
		//console.log("predicted steps  z="+ stepZ + "/ " + stepX);
		predTime = time + ((stepZ+1)*1000/60);
	} else {
		//console.log("predicted steps x= "+ stepX + "/ " + stepZ);
		predTime = time + ((stepX+1)*1000/60);
	}
	return {endX:endX, endZ: endZ, predTime: predTime};
}

global.Tank = Tank;
