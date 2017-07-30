    window.onload = function() {
        //TODO: Find best size after GUI is done
        var sWidth = window.innerWidth -10;
        var sHeight = window.innerHeight -100; 

        var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, "canvas", 
            { preload: preload, create: create, update: update, render: render });

        function preload(){

            game.load.image("sun", "img/Sun.jpg");
            game.load.image("earth", "img/Earth/Earth.jpg");
            game.load.image("moon", "img/Earth/Moon.jpg");
            game.load.image("shadow", "img/Shadow.png");
            game.load.image("mars", "img/Mars/Mars.jpg");
            game.load.image("deimos", "img/Mars/Deimos.jpg");
            game.load.image("phobos", "img/Mars/Phobos.jpg");

            game.load.image("ship", "img/Spaceship.png");
        }

        var sun;
        
        var earth;
        var moon;
        
        var mars;
        var deimos;
        var phobos;

        var rotationSpeed = 0.021;
        var revolutionSpeed = 1; //TODO: Implemented in orbit, make a GUI to change it.
        var ship;

        var angle = 3 * Math.PI / 180;

        //TODO A: Finish planet constructor
        function celestialBody(sprite, spriteX, spriteY, anchorX, anchorY, revolveAround, revolutionRadius) {
            this.sprite = game.add.sprite(spriteX, spriteY, sprite);
            //Center of the sprite
            this.sprite.anchor.setTo(anchorX, anchorY);
            //Each body must have own rotAngle to have different speed.
            this.rotAngle = angle;
            //Point to revolve around, sun for planets, planet for moons.
            this.revolveAround = revolveAround;
            //We will be seen but not be heard, We are
            this.revolutionRadius = revolutionRadius; //TODO: Find programmatically based on distance
            //Shadow. Attach to planet after moon are created, so it can cover them.
            this.shadow;
        }
        celestialBody.prototype.addShadow = function(shadowX, shadowY, alpha, scaleX, scaleY){
            this.shadow = game.add.sprite(shadowX, shadowY, "shadow");
            //Anchor must be 1, 0.5 to cover half of the body.
            this.shadow.anchor.setTo(1, 0.5);
            //Transparency
            this.shadow.alpha = alpha;
            this.shadow.scale.setTo(scaleX,scaleY);
        }


        function create(){
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //game.stage.backgroundColor = "#4488AA";
            //TODO: Adjust bounds
            game.world.setBounds(0, 0, 1280, 1024);
            
            var planetOffset = 120;
            var moonOffset = 25;
            var worldCenterX = game.world.centerX;
            var worldCenterY = game.world.centerY;

            //TODO: Maybe give an GFX to the sun.
            sun = new celestialBody(
                "sun",
                worldCenterX, worldCenterY,
                0.5, 0.5
                //The sun doesn't need other parameters
            );

            var sunX = sun.sprite.position.x;
            var sunY = sun.sprite.position.y;
            var sunCenter = {"x": sunX, "y": sunY };
            var earthStartX = sunX + planetOffset;

            earth = new celestialBody(
                "earth",
                earthStartX, worldCenterY,
                0.5, 0.5,
                sunCenter,
                80
            );

            var earthCenter = {"x": earth.sprite.position.x, "y": earth.sprite.position.y };

            moon = new celestialBody(
                "moon",
                earth.sprite.position.x + moonOffset, worldCenterY,
                0.5, 0.5,
                earthCenter,
                25
            );

            moon.addShadow(
                earth.sprite.position.x + moonOffset, worldCenterY,
                0.3,
                1, 0.2
            );

            //Earth's shadow is after the moon, since it has to cover it.
            earth.addShadow(
                earthStartX, worldCenterY,
                0.4,
                1, 1
            );

            var marsStartX = earthStartX+planetOffset;
            mars = new celestialBody(
                "mars",
                marsStartX, worldCenterY,
                0.5, 0.5,
                sunCenter,
                170
            );
            var marsCenter = {"x": mars.sprite.position.x, "y": mars.sprite.position.y };
            deimos = new celestialBody(
                "deimos",
                mars.sprite.position.x + moonOffset, worldCenterY,
                0.5, 0.5,
                marsCenter,
                25
            );
            deimos.addShadow(
                mars.sprite.position.x + moonOffset, worldCenterY,
                0.15,
                1, 0.2
            );

            phobos = new celestialBody(
                "phobos",
                mars.sprite.position.x + moonOffset, worldCenterY,
                0.5, 0.5,
                marsCenter,
                40
            );
            deimos.addShadow(
                mars.sprite.position.x + moonOffset, worldCenterY,
                0.15,
                1, 0.2
            );

            mars.addShadow(
                marsStartX, worldCenterY,
                0.2,
                0.8, 1
            );

            //TODO: Maybe remove, or make a transparent sprite for camera movement
            ship = game.add.sprite(worldCenterX-200, worldCenterY, "ship");
            ship.anchor.setTo(0.5, 0.5);
            game.physics.arcade.enable(ship);
            ship.body.collideWorldBounds = true;
            cursors = game.input.keyboard.createCursorKeys();
            game.camera.follow(ship);
        }

        function moveShip(){
            ship.body.velocity.x = 0;
            ship.body.velocity.y = 0;
            if (cursors.up.isDown)
            {
                ship.body.velocity.y = -350;
            }
            else if (cursors.down.isDown)
            {
                ship.body.velocity.y = 350;
            }
            if (cursors.left.isDown)
            {
                //ship.angle = 180; //Ship gets mirrored, maybe make a ship that's symmetric to avoid this.
                ship.body.velocity.x = -350;
            }
            else if (cursors.right.isDown)
            {
                //ship.angle = 0;
                ship.body.velocity.x = 350;
            }
        }

        function orbit(planet, orbitSpeed){

            //TODO: If moon, make it follow the planet in here.
            //Update shadow
            if (planet.shadow) {
                //Face away from sun
                planet.shadow.rotation = game.physics.arcade.angleBetween(planet.shadow, sun.sprite);
                //Follow planet
                planet.shadow.x = planet.sprite.position.x;
                planet.shadow.y = planet.sprite.position.y;
            };


            orbitSpeed = orbitSpeed*revolutionSpeed;
            // increase the angle of rotation at each frame
            planet.rotAngle += (3 * Math.PI / 180)*orbitSpeed;
           
            var newX = planet.revolveAround.x + planet.revolutionRadius * Math.cos(planet.rotAngle);
            var newY = planet.revolveAround.y + planet.revolutionRadius * Math.sin(planet.rotAngle);

            planet.sprite.x = newX;
            planet.sprite.y = newY;
        }

        function update(){
            earth.sprite.rotation += rotationSpeed;
            

            orbit(earth, 0.1);

            //Orbit around earth, update the position each frame since earth is moving.
            //TODO: Adjust moon's speed.
            moon.revolveAround = {"x": earth.sprite.position.x, "y": earth.sprite.position.y };
            orbit(moon, 0.3);

            //Mars's year is about twice as long as Earth's year.
            orbit(mars, 0.053);

            deimos.revolveAround = {"x": mars.sprite.position.x, "y": mars.sprite.position.y };
            orbit(deimos, 0.42);
            phobos.revolveAround = {"x": mars.sprite.position.x, "y": mars.sprite.position.y };
            orbit(phobos, 0.14);

            moveShip();
        }

        function render(){
            //game.debug.spriteInfo(earth, 32, 32);
        }

    };
