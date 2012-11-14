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
	this.health=100;
	this.cID;
}

/*================
  Static Variables
  ================*/
  Tank.ScaleX = 30;
  Tank.ScaleY = 30;
  Tank.ScaleZ = 30;
  Tank.Scale = 30;
  Tank.tankHalfW=30;
  Tank.tankHalfH=55;
  
/*=============
  move [Public]
  =============*/
Tank.prototype.move = function(newx, newz, rotY) {
	this.x = newx;
	this.z = newz;
	this.rotationY = rotY;
}

/*Tank.prorotype.endPoint=function()
{
	var aQuadrant=getAngularQuadrant(this.rotationY);
	var rQuadrant=getRegionalQuadrant();
	if(rQuadrant==1)
	{
		thresh12=800;
		thresh34=1600;
		
		if(aQuadrant==1)
		{
			var tangent=Math.tan(this.rotationY);
			var heightX=tangent*Math.abs(-800-this.z);
			if(heightX<thresh12)
			{
				this.endZ=-800;
				this.endX=this.x+heightX;
			}
			else
			{
				this.endX=800;
				this.endZ=this.z+(800-this.x)/tangent;
			}
		}
		
		if(aQuadrant==2)
		{
			var tangent=Math.tan(Math.PI-this.rotationY);
			var heightX=tangent*Math.abs(800-this.z);
			if(heightX<thresh12)
			{
				this.endZ=800;
				this.endX=this.x+heightX;
			}
			else
			{
				this.endX=-800;
				this.endZ=this.z+(800-this.x)/tangent;
			}
		}
		if(aQuadrant==3)
		{
			var tangent=Math.tan(3/4*Math.PI-this.rotationY);
			var heightX=tangent*Math.abs(800-this.z);
			if(heightX<thresh12)
			{
				this.endZ=800;
				this.endX=this.x+heightX;
			}
			else
			{
				this.endX=-800;
				this.endZ=this.z+(800-this.x)/tangent;
			}
		}
		
		
		
		
		
		
		
			
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	{
	
		var heightX=tangent*(800-this.z);
		if(this.x<0)
			heightThresh=800;
		else
			heightThresh=1600;
		
		
		if(heightX<heightThresh)
		{
			this.endZ=-800;
			this.endX=this.x+heightX;
		}
		else
		{
			this.endX=800;
			this.endZ=this.z-(800-this.x)/tangent;
			
		}
	}
	if(quadrant==2)
	{
		var tangent=Math.tan(Math.PI-this.rotationY);
		var heightX=tangent*(800-this.z);
		if(heightX<800)
		{
			this.endZ=-800;
			this.endX=this.x+heightX;
		}
		else
		{
			this.endX=-800;
			this.endZ=(800-this.x)/tangent+this.z;
			
		}
	}
	if (that.x <= Ball.WIDTH/2)
		{
			
			
			if(that.vx<0&&that.vy<0)
			{
				var tang=Math.abs(that.vx/that.vy);
				var newX=tang*that.y;
				
				if(newX>Pong.WIDTH)
				{
					this.impX=Pong.WIDTH-Ball.WIDTH/2;
					this.impY=this.y-(Pong.WIDTH/tang);
				}
				else if(newX<Pong.WIDTH)
				{
					this.impY=Ball.WIDTH/2;
					this.impX=this.y*tang;
				}
				
			}
			else if(that.vx<0&&that.vy>0)
			{
				var tang=Math.abs(that.vx/that.vy);
				var newX=tang*(Pong.HEIGHT-that.y);
				
				if(newX>Pong.WIDTH)
				{
					this.impX=Pong.WIDTH-Ball.WIDTH/2;
					this.impY=this.y+Pong.WIDTH/tang;
				}
				else if(newX<Pong.WIDTH)
				{
					this.impY=Pong.HEIGHT-Ball.WIDTH/2;
					this.impX=(Pong.HEIGHT-this.y)*tang;
				}
				
			}
			that.vx=-that.vx;
		}
		
		
		
		
		 else if(that.x >= Pong.WIDTH - Ball.WIDTH/2)
		 {
			if(that.vx>0&&that.vy<0)
			{
				var tang=Math.abs(that.vx/that.vy);
				var newX=tang*that.y;
				
				if(newX>Pong.WIDTH)
				{
					this.impX=Ball.WIDTH/2;
					this.impY=this.y-Pong.WIDTH*tang;
				}
				else if(newX<Pong.WIDTH)
				{
					this.impY=Ball.WIDTH/2;
					this.impX=Pong.WIDTH-this.y*tang;
				}
				
			}
			else if(that.vx>0&&that.vy>0)
			{
				var tang=Math.abs(that.vx/that.vy);
				var newX=tang*(Pong.HEIGHT-that.y);
				
				if(newX>Pong.WIDTH)
				{
					this.impX=Ball.WIDTH/2;
					this.impY=this.y+(Pong.WIDTH/tang);
				}
				else if(newX<Pong.WIDTH)
				{
					this.impY=Pong.HEIGHT-Ball.WIDTH/2;
					this.impX=Pong.WIDTH-(Pong.HEIGHT-this.y)*tang;
				}
				
			}
		 	that.vx=-that.vx;
		 }
}
















*/



function getAngularQuadrant(angle) {
		if (((angle > 0 && angle < Math.PI / 2) || (angle < 0 && angle > -2 * Math.PI && angle < -1.5 * Math.PI)) || angle == 0 || angle == -2 * Math.PI)
			return 1;
		else if (((angle > 0 && angle < Math.PI && angle > 0.5 * Math.PI) || (angle < 0 && angle < -Math.PI && angle > -1.5 * Math.PI)) || angle == Math.PI / 2 || angle == -1.5 * Math.PI)
			return 2;
		else if (((angle > 0 && angle > Math.PI && angle < 1.5 * Math.PI) || (angle < 0 && angle > -Math.PI && angle < -0.5 * Math.PI)) || angle == Math.PI || angle == -Math.PI)
			return 3;
		else
			return 4;
		
	};

function getRegionalQuadrant()
{
	if(this.x<=0&&this.x>=-800&&this.z<=0&&this.z>=-800)
		return 1;
	if(this.x<0&&this.x>-800&&this.z>=0&&this.z<=800)
		return 2;
	if(this.x>0&&this.x<=800&&this.z>0&&this.z<=800)
		return 3;
	else
		return 4;	
}










// For node.js require
global.Tank = Tank;