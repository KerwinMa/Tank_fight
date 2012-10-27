/*
Note: To get actual position of the tank in map we must
x-=500 and z+=500 from object's position.
x increases downwards and z increases to the left.



*/



function Map()
{
	this.map = [ // 1 2 3 4 5 6 7 8 9
			           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
			           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 1
			           [1, 0, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
			           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
			           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
			           [1, 0, 0, 0, 2, 0, 0, 0, 0, 1,], // 5
			           [1, 0, 0, 0, 0, 1, 0, 0, 0, 1,], // 6
			           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 7
			           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 8
			           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
			           ];
	this.mapW = this.map.length, this.mapH = this.map[0].length;
	this.UNITSIZE = 200;		           
	this.WALLHEIGHT = this.UNITSIZE / 5;
	this.tankHeight=110;
	this.getMapSector=function(v) 
	{
		var x = Math.floor((v.x + this.UNITSIZE / 2-100) / this.UNITSIZE + this.mapW/2);
		var z = Math.floor((v.z + this.UNITSIZE / 2-100) / this.UNITSIZE + this.mapW/2);
		return {x: x, z: z};
	}
	
	this.checkWallCollision=function(v) 
	{
		var c = this.getMapSector(v);
		return this.map[c.x][c.z] > 0;
	}

}