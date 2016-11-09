'use strict';

var ndarray = require('ndarray');

module.exports = function(game, opts) {
  return new Flatland(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry']
};

function Flatland(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-flatland requires voxel-registry plugin');

  this.block = opts.block;
  //if (!this.block) throw new Error('voxel-flatland requires block option');

  this.enable();
}

Flatland.prototype.enable = function() {
  this.game.voxels.on('missingChunk', this.onMissingChunk = this.missingChunk.bind(this));
};

Flatland.prototype.disable = function() {
  this.game.voxels.removeListener('missingChunk', this.onMissingChunk);
};


Flatland.prototype.missingChunk = function(position) {
  console.log('missingChunk',position);
  if(!game.shell.gl) return
  
  
  var blockIndex = this.registry.getBlockIndex("stone");
  
  
  if (!blockIndex) {
    throw new Error('voxel-flatland unable to find block of name: '+this.block);
  };
  
    
  var width = this.game.chunkSize;
  var pad = this.game.chunkPad;
  var arrayType = this.game.arrayType;

  var buffer = new ArrayBuffer((width+pad) * (width+pad) * (width+pad) * arrayType.BYTES_PER_ELEMENT);
  var voxelsPadded = ndarray(new arrayType(buffer), [width+pad, width+pad, width+pad]);
  var h = pad >> 1;
  var voxels = voxelsPadded.lo(h,h,h).hi(width,width,width);
  
  //can move this to the monster plugin I think
  // var mon = game.plugins.get('monster');
  // if(mon)
  //   mon.addPotential([position[0]*width,position[1]*width,position[2]*width])
  
  for (var x = 0; x < this.game.chunkSize; ++x) {
    for (var z = 0; z < this.game.chunkSize; ++z) {
      for (var y = 0; y < this.game.chunkSize; ++y) {
        if(x == 16||y==16||z == 16)
            voxels.set(x,y,z, blockIndex);
      }
    }
  }

  var chunk = voxelsPadded;
  chunk.position = position;

  console.log('about to showChunk',chunk);
  this.game.showChunk(chunk);
};
