// I am making some changes

// create a new scene
let gameScene = new Phaser.Scene('Game');

// initiate game parameters
gameScene.init = function() {

  this.isTerminating = false;

  this.playerSpeed = 150;
  this.jumpSpeed = -600;
}

// load assets
gameScene.preload = function(){
  // load images
  this.load.image('barrel', 'assets/images/barrel.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal', 'assets/images/gorilla3.png');
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');

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

  this.load.json('levelData', 'assets/json/levelData.json');
};

// called once after the preload ends
gameScene.create = function(){

  if (!this.anims.get('walking')){
    // walking animations
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('player', {
        frames: [0, 1, 2]
      }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });
  };

  if (!this.anims.get('burning')){
    // fire animations
    this.anims.create({
      key: 'burning',
      frames: this.anims.generateFrameNames('fire', {
        frames: [0, 1]
      }),
      frameRate: 4,
      repeat: -1
    });
  };

  // add all level elements
  this.setupLevel();

  // initiate barrel spawner
  this.setupSpawner();

  // create sprite
  let ground = this.add.sprite(180, 604, 'ground');
  // add sprite to physics
  this.physics.add.existing(ground, true);
  // add sprite to group
  this.platforms.add(ground);

  // create platform and add to group
  // let platform = this.add.tileSprite(176, 384, 3*36, 1*30, 'block');
  // this.physics.add.existing(platform, true);
  // this.platforms.add(platform);

  // collision detection
  this.physics.add.collider([this.player, this.goal, this.barrels], this.platforms);

  // overlap checks
  this.physics.add.overlap(this.player, [this.fires, this.goal, this.barrels], this.restartGame, null, this);

  // enable cursor keys
  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', function(pointer){
    console.log(pointer.x, pointer.y);
    });
};

// this is called up to 60 times per second
gameScene.update = function(){
  // check player on the ground
  let onGround = this.player.body.blocked.down || this.player.body.touching.down;

  // handle player moving
  if (this.cursors.left.isDown){
    // move left
    this.player.body.setVelocityX(-this.playerSpeed);
    this.player.flipX = false;
    // start walking animation
    if (onGround && (!this.player.anims.isPlaying))
      this.player.anims.play('walking');
  }
  else if(this.cursors.right.isDown){
    // move right
    this.player.body.setVelocityX(this.playerSpeed);
    this.player.flipX = true;
    // start walking animation
    if (onGround && (!this.player.anims.isPlaying))
      this.player.anims.play('walking');
  }
  else{
    // stop walking
    this.player.body.setVelocityX(0);
    this.player.anims.stop('walking');
    // set default frame
    if (onGround){
      this.player.setFrame(3);
      };
  }

  // handle player jumping
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)){
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    this.player.anims.stop('walking');

    // change frame
    this.player.setFrame(2);
  }
};

gameScene.gameOver = function(){
  this.isTerminating = true;
  this.cameras.main.shake(500);
  this.cameras.main.on('camerashakecomplete', function(camera, effect){
    this.cameras.main.fade(500);
  }, this);

  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
    this.scene.restart();
  }, this);
};

// sets up all the elements in the level
gameScene.setupLevel = function(){

  this.levelData = this.cache.json.get('levelData');

  // world bounds
  this.physics.world.bounds.width = this.levelData.world.width;
  this.physics.world.bounds.height = this.levelData.world.height;

  // create all the platforms
  this.platforms = this.physics.add.staticGroup();
  for (let i = 0; i < this.levelData.platforms.length; i++) {
    let curr = this.levelData.platforms[i];

    let newObj;

    // create object
    if (curr.numTiles == 1) {
      // create sprite
      newObj = this.add.sprite(curr.x, curr.y, curr.key).setOrigin(0);
    }
    else {
      // create tileSprite
      let width = this.textures.get(curr.key).get(0).width;
      let height = this.textures.get(curr.key).get(0).height;
      newObj = this.add.tileSprite(curr.x, curr.y, curr.numTiles * width , height , curr.key).setOrigin(0);
    }
    // enable physics
    this.physics.add.existing(newObj, true);

    // add to group
    this.platforms.add(newObj);
  };

  // create all the fires
  this.fires = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
  for (let i = 0; i < this.levelData.fires.length; i++) {
    let curr = this.levelData.fires[i];

    let newObj = this.add.sprite(curr.x, curr.y, 'fire').setOrigin(0);

    // // enable physics
    // this.physics.add.existing(newObj);
    // newObj.body.allowGravity = false;
    // newObj.body.immovable = true;

    // play burning animation
    newObj.anims.play('burning');

    // add to group
    this.fires.add(newObj);

    // this is for level creation
    newObj.setInteractive();
    this.input.setDraggable(newObj);
  };

  this.input.on('drag', function(pointer, gameObject, dragX, dragY){
    gameObject.x = dragX
    gameObject.y = dragY
    console.log(gameObject.x, gameObject.y)
  });

  // create player
  this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
  this.physics.add.existing(this.player);

  // set constraints of player to world bounds
  this.player.body.setCollideWorldBounds(true);

  // camera bounds
  this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
  this.cameras.main.startFollow(this.player);

  // goal
  this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
  this.physics.add.existing(this.goal);

};

// restart game (game over + you won!)
gameScene.restartGame = function(sourceSprite, targetSprite) {
  // fade out
  this.cameras.main.fade(500);

  // when fade out completes, restart scene
  this.cameras.main.on('camerafadeoutcomplete', function(){
    // restart the game
    this.scene.restart();
  }, this);
};

gameScene.setupSpawner = function(){
  //barrel group
  this.barrels = this.physics.add.group({
    bounceY: 0.1,
    bounceX: 1,
    collideWorldBounds: true
  });

  //spawn barrels
  let spawningEvent = this.time.addEvent({
    delay: this.levelData.spawner.interval,
    loop: true,
    callbackScope: this,
    callback: function(){
      // create a barrel
      let barrel = this.barrels.get(this.goal.x, this.goal.y, 'barrel');

      // interactive
      barrel.setActive(true);
      barrel.setVisible(true);
      barrel.body.enable = true;

      // set properties
      barrel.setVelocityX(this.levelData.spawner.speed);

      // lifespan
      this.time.addEvent({
        delay: this.levelData.spawner.lifespan,
        repeat: 0,
        callbackScope: this,
        callback: function(){
          this.barrels.killAndHide(barrel);
          barrel.body.enable = false;
        }
      });
    }
  });
};

// set the configuration of the game
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

// create a new game, pass the configuration
let game = new Phaser.Game(config);
