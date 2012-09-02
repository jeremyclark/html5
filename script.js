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
  var height = 500;
  var image = document.getElementById("sprite");

  canvas.width = width;
  canvas.height = height;

  var animloop,
        menuloop;

  var Player = function() {
    this.vy = 0;
    this.vx = 0;

    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDead = false;
    this.isFiring = false;
    this.direction = 'left';

        this.shots = [];

    this.width = 99;
    this.height = 134;

    this.cx = 0;
    this.cy = 0;
    this.cwidth = 99;
    this.cheight = 134;

    this.x = width / 2 - this.width / 2;
    this.y = 10;

    this.shoot = function() {
      this.shots.push(new Shot((this.x + 25), (this.y + 100), this.direction));
    };

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
    this.speed = Math.abs(Math.floor(Math.random() * 10 - 5)) + .5;
    this.isDead = false;
    this.isDying = false;
    this.deathAnimation = null;

    this.x = 850;
    this.y = canvas.height - this.height;
    this.cx = 47;
    this.cy = 272;
    this.cwidth = 107;
    this.cheight = 74;

    this.move = function() {
      if(this.isDying == true) {
        if(this.deathAnimation == null) {
          this.deathAnimation = new Gavel(this.x + (this.width / 2), this.y - 10, this);
        }

        if(!this.deathAnimation.done) {
          this.deathAnimation.move();
        }
      }

      if(this.isDead) return;

      if(!this.isDying) {
        this.x -= this.speed;
      }

      this.draw();
    };

    this.draw = function() {
      try{
      ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
      }catch(e){}
    };
  };

  var Shot = function(x, y, direction) {
    this.width = 60;
    this.height = 34;
    this.speed = 3;
    this.isFinished = false;

    this.direction = direction;
    this.x = x;
    this.y = y;

    this.cx = 198;
    this.cy = 0;

    this.move = function() {
      if(this.isFinished) return;

      if(this.direction == 'left') {
          this.x -= this.speed;
          this.y += this.speed;
      }else{
          this.x += this.speed;
          this.y += this.speed;
      }

      if(this.x > canvas.width || this.y > canvas.height) this.isFinished = true;

      this.draw();
    };

    this.draw = function() {
      try{
        ctx.drawImage(image, this.cx, this.cy, this.width, this.height, this.x, this.y, this.width, this.height);
      }catch(e){
      }
    };
  };

  var Gavel = function(x, y, parent) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.speed = 5;
    this.drawn = false;
    this.done = false;

    this.width = 100;
    this.height = 98;

    this.cx = 216;
    this.cy = 34;

    this.move = function() {
      if(!this.drawn) {
        this.draw();
        this.drawn = true;
      }

      if(this.rotation >= 44) {
        this.done = true;
        parent.isDead = true;
      }

      this.drawRotated();
    };

    this.draw = function() {
      try {
        ctx.drawImage(image, this.cx, this.cy, this.width, this.height, this.x, this.y, this.width, this.height);
      }catch(e){

      }
    };

    this.drawRotated = function() {
      ctx.save();

      // move to the middle of where we want to draw our image
      ctx.translate(this.x, this.y);

      // rotate around that point, converting our
      // angle from degrees to radians
      this.rotation += this.speed;
      ctx.rotate(this.rotation * (Math.PI / 180));

      // draw it up and to the left by half the width
      // and height of the image
      ctx.drawImage(image, this.cx, this.cy, this.width, this.height, -(this.width/2), -(this.height/2), this.width, this.height);

      ctx.restore();
    };
  };

  var Game = function() {
    var self = this;

    this.scoreElement = $('#score span');
    this.ambElement = $('#amb span');
    this.shotsElement = $('#shots span');

    this.gravity = 0.2;
    this.score = 0;

    this.player = null;
    this.ambulances = [];
    this.ambulanceCount = 1;
    this.ambulanceMax = 15;

    this.init = function() {
      this.player = new Player();
      this.addAmbulance(this.ambulanceCount);
    };

    this.tick = function() {
      ctx.clearRect(0, 0, width, height);
      this.player.move();

          for(var i=0; i < this.player.shots.length; i++) {
            this.player.shots[i].move();
          }

      for(var i=0; i < this.ambulances.length; i++){
      this.ambulances[i].move();
      }

          this.checkCollisions();

      this.deleteAmbulances();

      rand = Math.floor((Math.random()*100)+1);
      if(rand > 99) {
      self.addAmbulance(1);
      }

          this.updateStats();
    }

    this.checkCollisions = function() {
      for(var i = 0; i <this.player.shots.length; i++) {
        for(var j = 0; j < this.ambulances.length; j++) {
            var shot = this.player.shots[i];
            var ambulance = this.ambulances[j];

            if(shot.isFinished || ambulance.isDead) continue;
            if( ((shot.x >= ambulance.x && shot.x <= (ambulance.x + ambulance.width)) || (shot.x + shot.width >= ambulance.x && shot.x + shot.width <= (ambulance.x + ambulance.width)) ) &&
                 ((shot.y >= ambulance.y && shot.y <= (ambulance.y + ambulance.height)) || (shot.y + shot.height >= ambulance.y && shot.y + shot.height <= (ambulance.y + ambulance.height)) ) )
            {
                ambulance.isDying = true;
                shot.isFinished = true;
            }
        }
      }
    };

    this.reset = function() {
      this.window.reload;
    }

    this.addAmbulance = function(count) {
      this.ambulances.push(new Ambulance());
    };

    this.deleteAmbulances = function() {
      for(var i = 0; i < this.ambulances.length; i++) {
        if(this.ambulances[i].x < (-1 * this.ambulances[i].width)) {
          this.ambulances[i].isDead = true;
        }
      }
    };

        this.updateStats = function() {
            this.scoreElement.html(this.score);
            this.ambElement.html(this.ambulances.length);
            this.shotsElement.html(this.player.shots.length);
        };

    // Keyborad controls
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
                self.player.shoot();
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
