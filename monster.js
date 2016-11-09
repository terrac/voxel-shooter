'use strict';


module.exports = function(game, opts) {
  return new Monster(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry']
};


var spaceInvade = [{
  x: 1,c:8, 
}, {
  y: 1, c:1
}, {
  x: -1,c:8
}, {
  y: 1,c:1
}]

var spaceInvadeHorizontal = [{
  x: 1,c:8, 
}, {
  z: 1, c:1
}, {
  x: -1,c:8
}, {
  z: 1,c:1
}]

var spaceInvadeReverse = [{
  x: 1,c:8, 
}, {
  y: -1, c:1
}, {
  x: -1,c:8
}, {
  y: -1,c:1
}]

var spaceInvadeHorizontalReverse = [{
  x: 1,c:8, 
}, {
  z: -1, c:1
}, {
  x: -1,c:8
}, {
  z: -1,c:1
}]

var spaceInvadeNarrow = [{
  x: 1,c:2, 
}, {
  z: 1, c:1
}, {
  x: -1,c:2
}, {
  z: 1,c:1
}]
var monPattern = [spaceInvade,spaceInvadeHorizontal,spaceInvadeReverse,spaceInvadeHorizontalReverse,spaceInvadeNarrow]
function Monster(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-flatland requires voxel-registry plugin');
  this.registry.registerBlock('red', {
    texture: ['red', 'red', 'red'],
    creativeTab: 'formula'
  });

  this.monsterBlockList = []
  this.closest = []
  this.enable();

  game.score = 0
  
  this.count = 10
  this.pattern = 0
}

Monster.prototype.enable = function() {
  for(var i = 0; i < 20; i++){
    var a = []
    for(var j = 0; j < 3; j++)
      a.push(Math.floor(Math.random()*30)-15)
    this.add(a)
  }
  this.monsterID = game.setInterval(this.run.bind(this), 1000);
};

Monster.prototype.disable = function() {
  game.clearInterval(this.monsterID)
};


Monster.prototype.add = function(pos) {
  this.monsterBlockList.push({
    location: pos,
    monsterList: [],
    totalAdded:0
  })
}

Monster.prototype.run = function() {
  if(Math.random() < .05){
    var a = []
    for(var j = 0; j < 3; j++)
      a.push(Math.floor(Math.random()*30)-15)
    this.add(a)
  }
  if(this.count <= 0){
    this.count = 10
    this.pattern = (this.pattern +1) % monPattern.length
    
  }
  this.monsterBlockList = this.monsterBlockList.filter(function(a) {
    return a.totalAdded < 7
  })
  for (var x = 0; x < this.monsterBlockList.length; x++) {
    this.addMonster(this.monsterBlockList[x])
  }
};

var runMonster = function(monster) {
  monster.move.count =(monster.move.count +1) % monster.movePattern[monster.move.index].c
  if(!monster.move.count)
    monster.move.index = (monster.move.index +1) % monster.movePattern.length
  
  var cPattern = monster.movePattern[monster.move.index]
  var x = cPattern.x || 0
  var z = cPattern.y || 0
  var y = cPattern.z || 0
  
  var monsterHit = game.getBlock(monster.lastPos) == monster.enemyIndex || !game.getBlock(monster.lastPos)
  if (monsterHit) {
    game.score += 1000
    game.setscore(game.score)
  }
  if (monsterHit || monster.count < 1)
    monster.destroyed = true
  monster.count--
    game.setBlock(monster.lastPos, 0)
  if (monster.destroyed) return
  monster.lastPos = [x + monster.lastPos[0], y + monster.lastPos[1], z + monster.lastPos[2]]
  
  
  
  game.setBlock(monster.lastPos, monster.materialIndex)


  game.setTimeout(monster.runMonster.bind(null, monster), monster.speed || 300)
}

Monster.prototype.addMonster = function(monsterBlock) {
  var redIndex = this.registry.getBlockIndex("red");
  var greenIndex = this.registry.getBlockIndex("green")
  monsterBlock.monsterList = monsterBlock.monsterList.filter(function(a) {
    return !a.destroyed
  })
  if (monsterBlock.monsterList.length < 5) {

    var monster = {
      lastPos: monsterBlock.location.slice(),
      materialIndex: redIndex,
      count: 50,
      runMonster: runMonster,
      enemyIndex: greenIndex,
      movePattern: spaceInvadeHorizontal,
      move: {index:0,count:0}
    }
    monsterBlock.monsterList.push(monster)
    monsterBlock.totalAdded++
    monster.lastPos[0] += 1
    game.setBlock(monster.lastPos, redIndex)

    runMonster(monster, runMonster)

  }
}