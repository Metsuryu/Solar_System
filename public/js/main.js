var sun = new Image();
var moon = new Image();
var earth = new Image();
var angle = 0; //Current angle of Earth
var rSpeed = 0.83; //Rotation speed. The default revolution takes 60 seconds, so to rotate 365 times the speed is 365/60 = 60.83 
var revolSpeed = 60; //Revolution speed
var revolutions =  0; //Number of revolutions

function init(){
  sun.src = 'sun.jpg';
  moon.src = 'moon.jpg';
  earth.src = 'earth.jpg';
  window.requestAnimationFrame(draw);
}


function drawRotatedImage(image, x, y, angle) { 
var ctx = document.getElementById('canvas').getContext('2d');
	ctx.save(); 
	ctx.translate(x, y);
	ctx.rotate(angle * (Math.PI/180));
	ctx.drawImage(image, -(image.width/2), -(image.height/2));
	ctx.restore(); 
}

function speedUpdate(){
	rSpeed = parseFloat(document.getElementById("rotSpeed").value);
	revolSpeed = parseInt(document.getElementById("revSpeed").value);
	angle = 0;
	revolutions =  0;
	
	window.setInterval(function(){//increment revolution count after updating speed
		revolutions++;
		}, revolSpeed*1000);

	};

function countersUpdate(time){
document.getElementById("rotations").innerHTML =  parseInt(angle/360);
document.getElementById("revolutions").innerHTML = revolutions;
	};

function draw(){
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0,0,300,300); // clear canvas
  
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.strokeStyle = 'rgba(0,150,255,0.4)';
  ctx.save();
  ctx.translate(150,150);

  // Earth
  var time = new Date();
  //60s and 60000ms are the revolution speed, change both 1:1 to change speed.
  ctx.rotate( ((2*Math.PI)/revolSpeed)*time.getSeconds() + ((2*Math.PI)/(revolSpeed*1000))*time.getMilliseconds() ); 
  ctx.translate(105,0);
  ctx.fillRect(0,-12,35,24); // Shadow
  drawRotatedImage(earth,0,0,angle);
  angle += rSpeed;
  countersUpdate(time);

  // Moon
  ctx.save();
  ctx.rotate( ((2*Math.PI)/6)*time.getSeconds() + ((2*Math.PI)/6000)*time.getMilliseconds() );
  ctx.translate(0,28.5);
  ctx.drawImage(moon,-3.5,-3.5);
  ctx.restore();

  ctx.restore();
  
  ctx.beginPath();
  ctx.arc(150,150,105,0,Math.PI*2); // Earth orbit
  ctx.stroke();
 
  ctx.drawImage(sun,0,0);

  window.requestAnimationFrame(draw);
}

init();

$(document).ready(function(){
    speedUpdate();
});
