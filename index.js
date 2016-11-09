const ModalDialog = require('voxel-modal-dialog');

Gyronorm = require('./dist/gyronorm.complete.js');
const createEngine = require('voxel-engine-stackgl');

function main() {
  
  createEngine({
    exposeGlobal: true,
    pluginLoaders: {
      'voxel-flatland': require('./generation.js'),
      'monster': require('./monster.js'),
      
      'voxel-artpacks': require('voxel-artpacks'),
      
      
      'voxel-fullscreen': require('voxel-fullscreen')
    },
    pluginOpts: {
      'voxel-engine-stackgl': {
        appendDocument: true,
        exposeGlobal: true, // for debugging

        lightsDisabled: true,
        arrayTypeSize: 2, // arrayType: Uint16Array
        useAtlas: true,
        generateChunks: false,
        chunkDistance: 2,
        worldOrigin: [0, 0, 0],
        controls: {
          discreteFire: false,
          fireRate: 100, // ms between firing
          jumpTimer: 25
        },
        keybindings: {
          '<mouse 1>': 'fire'
        }
      },

      // built-in plugins
      'voxel-registry': {},
      'voxel-stitch': {
        artpacks: ['ProgrammerArt-ResourcePack.zip'],
        verbose: false

      },
      'voxel-flatland': {},
      'monster': {},

    }
  });
}

main();
var registry = game.plugins.get('voxel-registry')
registry.registerBlock('stone', {displayName: 'Smooth Stone', texture: 'stone', hardness:10.0, itemDrop: 'cobblestone', effectiveTool: 'pickaxe', requiredTool: 'pickaxe'});
registry.registerBlock('obsidian', {texture: 'obsidian', hardness: 128, requiredTool: 'pickaxe'});
registry.registerBlock('face', {texture: 'face', hardness: 128});
registry.registerBlock('green', {texture: ['green','green','green'],creativeTab:'formula'});



var phoneTurnScale = .05
var gn = new Gyronorm()
if (gn)
  gn.init().then(function() {
    gn.start(function(data) {
      if (!game) return;
      game.controls.target().avatar.rotation.x += -data.dm.alpha * phoneTurnScale
      game.controls.target().avatar.rotation.y += -data.dm.beta * phoneTurnScale
      game.controls.target().avatar.rotation.z += -data.dm.gamma * phoneTurnScale

    });
  }).catch(function(e) {
    // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
  });



var fireGreen=function() {
  var redIndex = game.plugins.get('voxel-registry').getBlockIndex("red")
  var greenIndex = game.plugins.get('voxel-registry').getBlockIndex("green")
    //
    var increment = game.cameraVector()
    var position = game.playerPosition()
    position[1] += 1
    var run=function(x,y,z,count,lastPos,run){
      
      x += increment[0]      
      y += increment[1]      
      z += increment[2]
      var newPos = [Math.round(x+ position[0]),Math.round(y+ position[1]),Math.round( z+position[2])]
      
      game.setBlock(lastPos, greenIndex)
      var nextBlock = game.getBlock(newPos)
      if(!(nextBlock == 0||nextBlock == greenIndex || nextBlock == redIndex))
        return
      game.setTimeout(function(){
          game.setBlock(lastPos, 0)
      },100)
      if(count > 0)
        game.setTimeout(run.bind(null,x,y,z,count-1,newPos,run),20)
    }
    run(0,0,0,20,position,run)
  
}

var notification =document.createElement("div")
  notification.style.top = '50%'
  notification.style.left = '10%'
  notification.style.right = '10%'
  notification.style.margin = 'auto'
  notification.style.fontSize = '4em'
  notification.classList.add("message")
  notification.id = 'notification'
  document.body.appendChild(notification)

game.setNotification= function(text){
  notification.innerHTML = text
  notification.style.opacity = 100
  setTimeout(function() {notification.style.opacity=0},2000)
}

game.controls.target().forces[1] = 0
game.controls.target().avatar.position.y = 0

game.setNotification("Touch or click to shoot the red blocks")


document.body.addEventListener("touchstart", touchHandler, false);
document.body.addEventListener("touchmove", touchHandler, false);
document.body.addEventListener("touchend", touchHandler, false);

var audio = new Audio('music1.mp3');
audio.volume = .01
audio.play();
game.on('fire', fireGreen);
function touchHandler(e) {
  
  if (e.type == "touchstart") {
    //audio.play();
    game.touch = true
    //alert("You touched the screen!");
  } else if (e.type == "touchmove") {
    //alert("You moved your finger!");
  } else if (e.type == "touchend" || e.type == "touchcancel") {
    //alert("You removed your finger from the screen!");
    game.touch = false
  }
}
game.on('tick',function (){
  if(game.touch)
    fireGreen()
})


var score =document.createElement("div")
  score.style.top = '80%'
  score.style.left = '80%'
  score.style.fontSize = '2em'
  score.id = 'score'
  score.classList.add("message")
  score.style.opacity = 0
  document.body.appendChild(score)

var scoreID = 0
game.setscore= function(text){
  score.innerHTML = text
  score.style.opacity = 100
  clearTimeout(scoreID)
  scoreID =setTimeout(function() {score.style.opacity=0},2000)
}


var timer =document.createElement("div")
  timer.style.top = '80%'
  timer.style.left = '2%'
  timer.style.fontSize = '2em'
  timer.id = 'timer'
  timer.classList.add("message")
  
  document.body.appendChild(timer)
var time = 60  
var timeClock=function(){
  time--
  timer.innerHTML = time
  if(time <= 0){
    game.setNotification("End game")
    return
  }
  game.setTimeout(timeClock,1000)
}
timeClock()