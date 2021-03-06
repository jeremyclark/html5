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
    this.shotCooldown = 0;
    this.speed = 12;
    
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
      if(this.shotCooldown <= 0) {
        this.shotCooldown = 15;
        this.isFiring = true;
        this.shots.push(new Shot((this.x + 25), (this.y + 100), this.direction));
      }else{
        this.isFiring = false;
      }
    };

    this.move = function() {

      if (this.isMovingLeft === true) {
        this.x -= this.speed;
      }

      if (this.isMovingRight === true) {
        this.x += this.speed;
      }
      
      if (this.x > width) this.x = 0 - this.width;
      else if (this.x < 0 - this.width) this.x = width;
      
      this.shotCooldown -= 1;
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
    this.isRunning = false;

    this.scoreElement = $('#score span');
    this.ambElement = $('#amb span');
    this.shotsElement = $('#shots span');
    this.fpsElement = $('#fps span');

    this.score = 0;
    this.ambulanceDeathScore = 1000;

    this.player = null;
    this.ambulances = [];
    this.ambulanceCount = 1;
    this.ambulanceMax = 15;
    this._clock = null;
    
    this.fps = 0;
    this.now = null;
    this.lastUpdate = (new Date)*1 - 1;
    this.fpsFilter = 50;

    this.init = function() {
      this.isRunning = true;
      
      if(this.player == null) {
        this.player = new Player();
      }

      if(this.ambulances.length == 0) {
        this.addAmbulance(this.ambulanceCount);
      }
      
      if(this._clock === null) {
        this._clock = this.clock();
        this.fpsInit();
      }
    };

    this.tick = function() {
      if(!this.isRunning) return;

      ctx.clearRect(0, 0, width, height);
      this.player.move();

      for(var i=0; i < this.player.shots.length; i++) {
        this.player.shots[i].move();
      }

      for(var i=0; i < this.ambulances.length; i++){
        if(this.ambulances[i] === null) continue;
        this.ambulances[i].move();
      }

      this.checkCollisions();

      this.deleteAmbulances();

      rand = Math.floor((Math.random()*100)+1);
      if(rand > 97) {
      self.addAmbulance(1);
      }
      
      this.calcFps();
      this.updateStats();
    }

    this.checkCollisions = function() {
      for(var i = 0; i <this.player.shots.length; i++) {
       var shot = this.player.shots[i];
        if(shot.isFinished) continue;
        
        for(var j = 0; j < this.ambulances.length; j++) {
          var ambulance = this.ambulances[j];
          
          if(ambulance === null) continue;
          
          var left1, left2;
          var right1, right2;
          var top1, top2;
          var bottom1, bottom2;
          
          left1 = shot.x;
          left2 = ambulance.x;
          
          right1 = shot.x + shot.width;
          right2 = ambulance.x + ambulance.width;
          
          top1 = shot.y;
          top2 = ambulance.y;
          
          bottom1 = shot.y + shot.height;
          bottom2 = ambulance.y + ambulance.height;
          
          if(bottom1 < top2 || top1 > bottom2 || right1 < left2 || left1 > right2) {
              continue;
          }else{
              ambulance.isDying = true;
              shot.isFinished = true;
              this.updateScore(this.ambulanceDeathScore);
              break;
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
        if(this.ambulances[i] === null) continue;
        if(this.ambulances[i].x < (-1 * this.ambulances[i].width) || this.ambulances[i].isDead) {
          this.ambulances[i] = null;
        }
      }
    };

    this.updateStats = function() {
      this.scoreElement.html(this.score);
      this.ambElement.html(this.ambulances.length);
      this.shotsElement.html(this.player.shots.length);
    };

    this.updateScore = function(amount) {
      this.score += amount;
    };
    
    this.fpsInit = function() {
      var self = this;
      
      setInterval(function(){
        self.fpsElement.html(self.fps.toFixed(1));
      }, 1000); 
    };
    
    this.calcFps = function() {
      var thisFrameFPS = 1000 / ((now=new Date) - this.lastUpdate);
      this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
      this.lastUpdate = now;
    };
    
    this.pause = function() {
        this.isRunning = false;
    };
    
    this.clock = function() {
      menuLoop = function() {
        game.tick();
        requestAnimFrame(menuLoop);
      };

      menuLoop();
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
        self.player.shoot();
      }

      if(key == 37 || key == 39 || key == 32){
        return false;
      }
    };

    document.onkeyup = function(e) {
      var key = e.keyCode;

      if (key == 37) {
        self.player.isMovingLeft = false;
      } else if (key == 39) {
        self.player.isMovingRight = false;
      }else if (key == 32) {
        self.player.isFiring = false;
      }
    };
   };

  var game = new Game();

  $('#play').click(function(){ 
   if(game.isRunning == false) {
      game.init();
      $(this).blur();
    }
  });

  $('#stop').click(function(){
    game.pause();
  });

  
});
