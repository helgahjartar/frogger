/**
*   ----- VERKEFNI 1 - TÖLVUGRAFÍK ----
*                 FROGGER
*           HELGA HJARTARDÓTTIR
*   -----------------------------------
*/


// TODO : Láta tjekka hvort kominn sé yfir götu
//        Collission
//        Teikna strik f stigin?

var canvas;
var gl;

var maxNumPoints = 200;
var vPosition;
var vColor;
var bufferId;
var colBuffer;
var locColor;
var modLoc;

var keyArray = [];

var gray = vec4(0.6, 0.6, 0.6, 1.0 );
var green = vec4(0.0, 1.0, 0.0, 1.0);
var black = vec4(0.0, 0.0, 0.0, 1.0);
var blue = vec4(0.0, 0.0, 1.0, 1.0);
var red = vec4(1.0, 0.0, 0.0, 1.0);
var white = vec4(1.0, 1.0, 1.0, 1.0);

var score = 0;
var crash = false;
var hitWall = false;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*5000, gl.DYNAMIC_DRAW );

    colBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 8*2*5000, gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation(program, "rcolor");

    window.addEventListener("keydown", function(e) {
      keyArray[e.keyCode] = true;

    });

    window.addEventListener("keyup", function(e) {
      keyArray[e.keyCode] = false;
    });

    main();
}

///////////////////////
////// Helpers ///////
//////////////////////

function keyDown(key) {
	return keyArray[key];
}

function reloadPage() {
    location.reload();
}

///////////////////////
///// Sidewalks  //////
//////////////////////
var sidewalks = {

  vertices1 : [
      vec2(  1.0,  1.0 ),
      vec2(  1.0, 0.6 ),
      vec2( -1.0, 0.6 ),
      vec2( -1.0,  1.0 )
  ],

  vertices2 : [
    vec2(  -1.0,  -1.0 ),
    vec2(  -1.0, -0.6 ),
    vec2(  1.0, -0.6 ),
    vec2(  1.0,  -1.0 )
  ],


  render : function(vertices) {
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(vertices) );

    // gl.bindBuffer( gl.ARRAY_BUFFER, colBuffer);
    // gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(this.colors1) );

    // Draw sidewalks
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(gray) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
  },

  drawSidewalks : function() {
    this.render(this.vertices1);
    this.render(this.vertices2);
  }
}

///////////////////
///// Lanes //////
//////////////////
var lanes = {

  vertices1 : [
      vec2(  1.0,  0.24 ),
      vec2(  1.0, 0.23 ),
      vec2( -1.0, 0.23 ),
      vec2( -1.0,  0.24 )
  ],

  vertices2 : [
    vec2(  -1.0, -0.17 ),
    vec2(  -1.0, -0.18 ),
    vec2(  1.0, -0.18 ),
    vec2(  1.0,  -0.17 )
  ],


  render : function(vertices) {
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(vertices) );

    // Draw sidewalks
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(white) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
  },

  drawLanes : function() {
    this.render(this.vertices1);
    this.render(this.vertices2);
  }
}

///////////////////////
////   Frogger   /////
//////////////////////
var frogger = {

    direction : { up : false, down : false },
    crash : false,
    lanes : {lane3 : false, lane2 : false, lane1 : false},
    position : vec2(0.0,0.0),
    radius : -0.85,
    crossedUpper: false,

    vertices : [
      vec2( -0.56, -0.8 ),
      vec2( -0.5,  -0.65 ),
      vec2( -0.44, -0.8 )
    ],

    updateFrogger : function() {
      var x = 0, y = 0;

      // Set x and y values based on key pressed
      // Return if wall is hit
      if(keyDown(37)){
        if (this.vertices[0][0] - 0.015 < -1) return;
        x -= 0.015;
      }
      if(keyDown(38)) {
        if (this.vertices[1][1] + 0.015 > 1) return;
        y += 0.015;
        this.direction.up = true;
        this.direction.down = false;
      }
      if(keyDown(40)) {
        if (this.vertices[1][1] - 0.015 < -1) return;
        y -= 0.015;
        this.direction.down = true;
        this.direction.up = false;
      }
      if(keyDown(39)) {
        if (this.vertices[2][0] + 0.015 > 1) return;
        x += 0.015;
      }

        for (var i = 0; i < this.vertices.length; i++) {
            this.vertices[i][0] += x;
            this.vertices[i][1] += y;
            console.log(this.vertices[0][1]);

        }


      //Calculate score
      if (this.crossedUpper == false){
        if (this.vertices[0][1] < 0.60) {
          if (this.vertices[0][1] > 0.59  && this.direction.up) {
            score++;
            this.crossedUpper = true;
          }
        }
      }
      if (this.crossedUpper == true) {
        if (this.vertices[0][1] > -0.60) {
          if (this.vertices[0][1] < -0.58 && this.direction.down){
            score++;
            this.crossedUpper = false;
          }
        }
      }

      // Set direction of frogger
      if (this.vertices[0][1] < this.vertices[1][1] && this.direction.down) {
          this.vertices[1][1] = this.vertices[1][1] - 0.3;
      } else if (this.vertices[0][1] > this.vertices[1][1] && this.direction.up) {
            this.vertices[1][1] = this.vertices[1][1] + 0.3;
        }

        this.checkForCrash(cars.vertices1, this.lanes.lane1);
        this.checkForCrash(cars.vertices2, this.lanes.lane2);
        this.checkForCrash(cars.vertices3, this.lanes.lane3);
        this.checkForCrash(cars.vertices4, this.lanes.lane3);
    },

    // Collission detection
    checkForCrash : function (car, lane) {
      this.froggerInLane();
      var pointerX = this.vertices[1][0];
      var leftX = this.vertices[0][0];
      var rightX = this.vertices[2][0];
      if (lane == true) {
        var pointerCrash = car[2][0] < pointerX && car[0][0] > pointerX;
        var leftCrash = car[2][0] < leftX && car[0][0] > leftX;
        // var rightCrash = car[0][0] > rightX && car[2][0] < rightX;
      }
        if (pointerCrash || leftCrash) {
          crash = true;
        }
    },

    // See which driving lane frogger is in
    froggerInLane : function () {
      this.resetLanes();
      var pointerY = this.vertices[1][1];
      if (this.direction.up) {
        if (-0.45 < pointerY && pointerY < -0.12) {this.lanes.lane3 = true};
        if (-0.05 < pointerY && pointerY < 0.30) {this.lanes.lane2 = true};
        if (0.3 < pointerY && pointerY < 0.63) {this.lanes.lane1 = true};
      } else if (this.direction.down) {
        if (-0.58 < pointerY && pointerY < -0.25) {this.lanes.lane3 = true};
        if (-0.18 < pointerY && pointerY < 0.15) {this.lanes.lane2 = true};
        if (0.15 < pointerY && pointerY < 0.50) {this.lanes.lane1 = true};
      }
    },

    // Reset each lane before checking where frogger is
    resetLanes : function () {
      this.lanes.lane1 = false;
      this.lanes.lane2 = false;
      this.lanes.lane3 = false;
    },

    render : function () {
      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(this.vertices) );

      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.uniform4fv( locColor, flatten(green) );
      gl.drawArrays( gl.TRIANGLE_FAN, 0, this.vertices.length );
    }
}

///////////////////////
//////   Cars  ///////
//////////////////////
var cars = {

  position : vec2(0,0),

  vertices1 : [
    vec2(  -1.0,  0.3 ),
    vec2(  -1.0, 0.5 ),
    vec2( -1.5, 0.5 ),
    vec2( -1.5,  0.3 )
  ],

  vertices2 : [
    vec2(  -1.0,  -0.05 ),
    vec2(  -1.0, 0.15 ),
    vec2( -1.5, 0.15 ),
    vec2( -1.5,  -0.05 )
  ],

  vertices3 : [
    vec2(  -1.0,  -0.45 ),
    vec2(  -1.0, -0.25 ),
    vec2( -1.5, -0.25 ),
    vec2( -1.5,  -0.45 )
  ],

  vertices4 : [
    vec2(  -2.5,  -0.45 ),
    vec2(  -2.5, -0.25 ),
    vec2( -3.0, -0.25 ),
    vec2(-3.0,  -0.45 )
  ],

  driveCar : function (vertices) {

    // Set car speed
    for (var i = 0; i < vertices.length; i++) {
      if (vertices == this.vertices1 ) {
        vertices[i][0] += 0.019;
      } else if (vertices == this.vertices2) {
        vertices[i][0] += 0.026;
      } else {
        vertices[i][0] += 0.015;
      }
      // Get new car in lane
      if (vertices[i][0] > 1.5) {
        var p = i + 2 ;
        vertices[i][0] = -1.0;
        vertices[p][0] = -1.5;
      }
    }
  },

    render : function (vertices) {
      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(vertices) );

      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      if (vertices == this.vertices2) {
        gl.uniform4fv( locColor, flatten(black) );
      } else if (vertices == this.vertices3) {
        gl.uniform4fv( locColor, flatten(blue) );
      } else if (vertices == this.vertices1 || vertices == this.vertices4) {
        gl.uniform4fv( locColor, flatten(red) );
      }
      gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length );

      this.driveCar(vertices);
    },

    startCars : function () {
      this.render(this.vertices1);
      this.render(this.vertices2);
      this.render(this.vertices3);
      this.render(this.vertices4);
    }

}


function main() {
    frogger.updateFrogger();

    gl.clear( gl.COLOR_BUFFER_BIT );

    sidewalks.drawSidewalks();
    lanes.drawLanes();
    cars.startCars();


    frogger.render();

    document.querySelector('.results').innerHTML = "Your score is = " + score;

    if (this.score < 10 && !crash) {
      window.requestAnimFrame(main);
    } else if (crash) {
      document.querySelector('.results').innerHTML = "Watch out for the cars!";
    } else {
      document.querySelector('.results').innerHTML = "You're a winner!";
      console.log("You won!");
    }
}
