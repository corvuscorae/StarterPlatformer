class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.GRAVITY = 2000;
        this.physics.world.gravity.y = this.GRAVITY;
        this.JUMP_VELOCITY = -600;

        this.debug = true;
        this.underWater = 0;
        this.onWater = 0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 80, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        /* WATER */
        this.waterLayer = this.map.createLayer("Water", this.tileset, 0, 0);
        this.waterLayer.setScale(2.0);
        
        /* BG */
        this.bgLayer = this.map.createLayer("bg", this.tileset, 0, 0);
        this.bgLayer.setScale(2.0);

        /* GROUND */
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/8, game.config.height/4, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        
        /* WATER */////////////////////////
        this.waterLayer.setCollisionByProperty({
            waterBody: true,
        });
        
        let sprite = my.sprite.player;
        this.physics.add.overlap(
            sprite,
            this.waterLayer,
            (sprite, tile) => {
                if(tile.properties.waterBody == true){ 
                    this.underWater = 2;
                }
                else if (tile.properties.waterBody == false){ 
                    this.underWater = 1; 
                } else {
                    this.underWater = 0; 
                }

                //this.water(tile.properties.waterSurface);
            }
        );

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
    }

    update() {
        //this.acceleration = this.underWater ? this.ACCELERATION/3 : this.ACCELERATION;
        //this.physics.world.gravity.y = this.underWater ? 0 : this.GRAVITY;

        //console.log(3 * this.onWater);
        this.acceleration = (
            this.ACCELERATION - 
            (this.ACCELERATION * (this.underWater/3)));
        this.physics.world.gravity.y = (
            this.GRAVITY - 
            (this.GRAVITY * (this.underWater / 2)));

        if(cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.acceleration);
            
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setAccelerationX(this.acceleration);

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);

            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        switch(this.underWater){
            case 0:     // on land
                if( my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                        my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);     
                }    
                break; 
            case 1:     // on surface of water
                if( my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                        my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY / 2);     
                }
                break;
            case 2:     // underwater
                if(cursors.up.isDown){
                    my.sprite.player.body.setAccelerationY(-this.acceleration);
                } else if(cursors.down.isDown){
                    my.sprite.player.body.setAccelerationY(this.acceleration);
                } else {
                    my.sprite.player.body.setVelocityY(this.GRAVITY / 200);
                    my.sprite.player.body.setDragY(this.DRAG / 100);
                }
                break;
        }


        ////////
        //console.log(`this.underWater: ${this.underWater}\nthis.onWater: ${this.onWater}`);
    }

    water(tile){ 
        console.log(tile); 
    }
}