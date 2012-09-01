$(document).ready(function(){

  // RequestAnimFrame: a browser API for getting smooth animations
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var width = 960;
  var height = 600;
  var image = document.getElementById("sprite");

  canvas.width = width;
  canvas.height = height;

  var position = 0,
      gravity = 0.2,
      animloop,
      flag = 0,
      menuloop,
      game,
      dir,
      score = 0,
      firstRun = true;

	  
	var Player = function() {
		this.vy = 0;
		this.vx = 0;

		this.isMovingLeft = false;
		this.isMovingRight = false;
		this.isDead = false;
		this.isFiring = false;
		this.direction = 'left';

		this.width = 99;
		this.height = 134;

		//Sprite clipping
		this.cx = 0;
		this.cy = 0;
		this.cwidth = 99;
		this.cheight = 134;

		this.x = width / 2 - this.width / 2;
		this.y = 10;

		this.move = function() {
			this.y +=this.vy;

			//Accelerations produces when the user hold the keys
			if (this.isMovingLeft === true) {
			  this.x += this.vx;
			  this.vx -= 0.15;
			} else {
			  this.x += this.vx;
			  if (this.vx < 0) this.vx += 0.1;
			}

			if (this.isMovingRight === true) {
			  this.x += this.vx;
			  this.vx += 0.15;
			} else {
			  this.x += this.vx;
			  if (this.vx > 0) this.vx -= 0.1;
			}

			//Make the this move through walls
			if (this.x > width) this.x = 0 - this.width;
			else if (this.x < 0 - this.width) this.x = width;
			
			this.draw();
		};
		
		
		//Function to draw it
		this.draw = function() {
		  try {
			if (this.direction == 'right') this.cx = 99;
			else if (this.direction == 'left') this.cx = 0;

			if(this.isFiring) this.cy = 134;
			else this.cy = 0;

			ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		  } catch (e) {}
		};
	};

	var Ambulance = function() {
		this.width = 107;
		this.height = 77;
		this.speed = 5;
		this.isDead = false;

		this.x = 850;
		this.y = 600 - this.height;
		this.cx = 47;
		this.cy = 272;
		this.cwidth = 107;
		this.cheight = 74;
		
		this.move = function() {		
			if(this.isDead) return;
			
			this.x -= this.speed;
			this.draw();
		};
		
		this.draw = function() {
		  try{
			ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		  }catch(e){}
		};
	};	  
	  
	  
	var Game = function() {
		var self = this;
		this.player = null;
		this.ambulances = [];
		this.ambulanceCount = 1;
		
		
		this.init = function() {
			this.player = new Player();
			this.addAmbulance(this.ambulanceCount);
		};
		
		this.tick = function() {
		  ctx.clearRect(0, 0, width, height);
		  this.player.move();
		  
		  for(var i=0; i < this.ambulanceCount; i++){
			this.ambulances[i].move();
		  }
			
		  this.deleteAmbulances();
		}
		  
		this.reset = function() {
		  this.window.reload;
		}
		
		this.addAmbulance = function(count) {
			for(var i=0; i < count; i++) {
				this.ambulances.push(new Ambulance());
			}
		};
		
		this.deleteAmbulances = function() {
			for(var i = 0; i < this.ambulances.length; i++) {
				if(this.ambulances[i].x < (-1 * this.ambulances[i].width)) {
					this.ambulances[i].isDead = true;
				}
			}
		};
		
		//Adding keyboard controls
		document.onkeydown = function(e) {
			var key = e.keyCode;

			if (key == 37) {
				self.player.direction = 'left';
				self.player.isMovingLeft = true;
			} else if (key == 39) {
				self.player.direction = 'right';
				self.player.isMovingRight = true;
			}else if (key == 32) {
				self.player.isFiring = true;
			 }
		};

		document.onkeyup = function(e) {
			var key = e.keyCode;

			if (key == 37) {
				self.player.direction = 'left';
				self.player.isMovingLeft = false;
			} else if (key == 39) {
				self.player.direction = 'right';
				self.player.isMovingRight = false;
			}else if (key == 32) {
				self.player.isFiring = false;
			}
		};		
	 };
 
	
	var game = new Game();
	game.init();
	
	menuLoop = function() {
		game.tick();
		requestAnimFrame(menuLoop);
	 };

	menuLoop();
});
