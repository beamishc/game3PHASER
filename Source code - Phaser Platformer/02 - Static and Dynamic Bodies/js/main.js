// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {};

// load asset files for our game
gameScene.preload = function() {

  // load images
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal', 'assets/images/gorilla3.png');
  this.load.image('barrel', 'assets/images/barrel.png');

  // load spritesheets
  this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
    frameWidth: 28,
    frameHeight: 30,
    margin: 1,
    spacing: 1
  });

  this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', {
    frameWidth: 20,
    frameHeight: 21,
    margin: 1,
    spacing: 1
  });
};

// executed once, after assets were loaded
gameScene.create = function() {

  this.platforms = this.add.group();

  // ground
  let ground = this.add.sprite(180, 604, 'ground');
  this.physics.add.existing(ground, true);
  this.platforms.add(ground);

  // platform
  let platform = this.add.tileSprite(180, 500,4 * 36 ,1 * 30 ,'block');
  this.physics.add.existing(platform, true);
  this.platforms.add(platform);


  // player
  this.player = this.add.sprite(180, 400, 'player', 3);
  this.physics.add.existing(this.player);

  // disable gravity
  //ground.body.allowGravity = false;

  // make it immovable
  //ground.body.immovable = true;

  // 2) creating and adding sprites to the physics system
  //let ground2 = this.physics.add.sprite(180, 200, 'ground');

  // collision detection
  //this.physics.add.collider(ground, ground2);
  this.physics.add.collider(this.player, this.platforms);
};

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Monster Kong',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 1000},
      debug: true
    }
  }
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
