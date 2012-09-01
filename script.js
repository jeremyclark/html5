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

  var player,
      ambulanceCount = 1,
      ambulances = [],
      position = 0,
      gravity = 0.2,
      animloop,
      flag = 0,
      menuloop,
      game,
      dir,
      score = 0,
      firstRun = true;

  var Game = function() {
    this.tick = function() {
      ctx.clearRect(0, 0, width, height);

      player.y += player.vy;
      //player.vy += gravity;

      if (player.vy > 0 &&
        (player.x + 15 < 260) &&
        (player.x + player.width - 15 > 155) &&
        (player.y + player.height > 475) &&
        (player.y + player.height < 500))
        player.jump();

      if (dir == "left") {
        player.dir = "left";
        if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
      } else if (dir == "right") {
        player.dir = "right";
        if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
      }

      //Adding keyboard controls
      document.onkeydown = function(e) {
        var key = e.keyCode;

        if (key == 37) {
            dir = "left";
            player.isMovingLeft = true;
          } else if (key == 39) {
            dir = "right";
            player.isMovingRight = true;
          }else if (key == 32) {
            player.isFiring = true;
          }

        };

        document.onkeyup = function(e) {
          var key = e.keyCode;

          if (key == 37) {
            dir = "left";
            player.isMovingLeft = false;
          } else if (key == 39) {
            dir = "right";
            player.isMovingRight = false;
          }else if (key == 32) {
            player.isFiring = false;
          }
        };

        //Accelerations produces when the user hold the keys
        if (player.isMovingLeft === true) {
          player.x += player.vx;
          player.vx -= 0.15;
        } else {
          player.x += player.vx;
          if (player.vx < 0) player.vx += 0.1;
        }

        if (player.isMovingRight === true) {
          player.x += player.vx;
          player.vx += 0.15;
        } else {
          player.x += player.vx;
          if (player.vx > 0) player.vx -= 0.1;
        }

        //Make the player move through walls
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;

        player.draw();
        for(var i=0;i<ambulanceCount;i++){
          ambulances[i].draw();
        }
      }
    this.reset = function() {
      this.window.reload;
    }
  };
  var game = new Game();

  var Player = function() {
    this.vy = 0;
    this.vx = 0;

    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDead = false;
    this.isFiring = false;

    this.width = 99;
    this.height = 134;

    //Sprite clipping
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 99;
    this.cheight = 134;

    this.dir = "left";

    this.x = width / 2 - this.width / 2;
    this.y = 10;

    //Function to draw it
    this.draw = function() {
      try {
        if (this.dir == "right") this.cx = 99;
        else if (this.dir == "left") this.cx = 0;

        if(this.isFiring) this.cy = 134;
        else this.cy = 0;

        ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
      } catch (e) {}
    };

    this.jump = function() {
      this.vy = 0;
    };

    this.jumpHigh = function() {
      this.vy = 0;
    };
  };

  player = new Player();

  var Ambulance = function() {
    this.width = 107;
    this.height = 77;

    this.x = 850;
    this.y = 600 - this.height;
    console.log(window.innerWidth);
    this.cx = 47;
    this.cy = 272;
    this.cwidth = 107;
    this.cheight = 74;

    this.draw = function() {
      try{
        ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
      }catch(e){}
    };

  };

  for(var i=0; i<ambulanceCount;i++) {
    ambulances.push(new Ambulance());
  }


  menuLoop = function() {
    game.tick();
    requestAnimFrame(menuLoop);
  };

  menuLoop();

  $('#play').click(function(){
    init();
  });
});
