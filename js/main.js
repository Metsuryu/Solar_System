    window.onload = function() {
        //TODO: Find best size after GUI is done
        var sWidth = window.innerWidth -10;
        var sHeight = window.innerHeight -100; 

        var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, "canvas", 
            { preload: preload, create: create, update: update, render: render });

        function preload(){

            game.load.image("sun", "img/sun.jpg");
            game.load.image("earth", "img/earth.jpg");
            game.load.image("moon", "img/moon.jpg");
            game.load.image("shadow", "img/shadow.png");
            game.load.image("mars", "img/mars.jpg");

            game.load.image("ship", "img/Spaceship.png");
        }

        var sun;
        var earth;
        var moon;
        var mars;
        var rotationSpeed = 0.021;
        var revolutionSpeed = 1; //TODO: Implemented in orbit, make a GUI to change it.
        var ship;

        var angle = 3 * Math.PI / 180;

        function create(){
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //game.stage.backgroundColor = "#4488AA";
            //TODO: Adjust bounds
            game.world.setBounds(0, 0, 1280, 1024);
            
            var planetOffset = 100;
            var moonOffset = 25;

            sun = game.add.sprite(game.world.centerX, game.world.centerY, "sun");
            sun.anchor.setTo(0.5, 0.5);

            //TODO A: Make planet constructor!!
            var earthStartX = sun.position.x + planetOffset;
            earth = game.add.sprite(earthStartX, game.world.centerY, "earth");
            earth.anchor.setTo(0.5, 0.5);
            //Each planet must have own rotAngle to have different speed.
            earth.rotAngle = angle;
            //Point to revolve around.
            earth.revolveAround = {"x": sun.position.x, "y": sun.position.y };
            //We will be seen but not be heard, We are
            earth.revolutionRadius = 80; //TODO: Find programmatically based on distance

            moon = game.add.sprite(earth.position.x + moonOffset, game.world.centerY, "moon");
            moon.anchor.setTo(0.5, 0.5);
            moon.rotAngle = angle;
            moon.revolveAround = {"x": earth.position.x, "y": earth.position.y };
            moon.revolutionRadius = 25; //TODO: Find programmatically based on distance

            //Earth's shadow is after the moon, since it has to cover it.
            earth.shadow = game.add.sprite(earthStartX, game.world.centerY, "shadow");
            //Must be 1, 0,5 so it covers half earth.
            earth.shadow.anchor.setTo(1, 0.5);
            //Transparency
            earth.shadow.alpha = 0.4;


            var marsStartX = earthStartX+planetOffset;
            mars = game.add.sprite(marsStartX, game.world.centerY, "mars");
            mars.anchor.setTo(0.5, 0.5);
            //Each planet must have own rotAngle to have different speed.
            mars.rotAngle = angle;
            //Point to revolve around.
            mars.revolveAround = {"x": sun.position.x, "y": sun.position.y };
            mars.revolutionRadius = 140; //TODO: Find programmatically based on distance
            //Shadow
            mars.shadow = game.add.sprite(marsStartX, game.world.centerY, "shadow");
            //Must be 1, 0,5 so it covers half mars.
            mars.shadow.anchor.setTo(1, 0.5);
            //Transparency
            mars.shadow.alpha = 0.2;

            //TODO A: Make planet constructor!!


            //TODO: Maybe remove, or make a transparent sprite for camera movement
            ship = game.add.sprite(game.world.centerX-200, game.world.centerY, "ship");
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

            //Update shadow
            if (planet.shadow) {
                //Face away from sun
                planet.shadow.rotation = game.physics.arcade.angleBetween(planet.shadow, sun);
                //Follow planet
                planet.shadow.x = planet.position.x;
                planet.shadow.y = planet.position.y;
            };


            orbitSpeed = orbitSpeed*revolutionSpeed;
            // increase the angle of rotation at each frame
            planet.rotAngle += (3 * Math.PI / 180)*orbitSpeed;
           
            var newX = planet.revolveAround.x + planet.revolutionRadius * Math.cos(planet.rotAngle);
            var newY = planet.revolveAround.y + planet.revolutionRadius * Math.sin(planet.rotAngle);

            planet.x = newX;
            planet.y = newY;
        }

        function update(){
            earth.rotation += rotationSpeed;
            

            orbit(earth, 0.1);


            //Orbit around earth, update the position each frame since earth is moving.
            moon.revolveAround = {"x": earth.position.x, "y": earth.position.y };
            orbit(moon, 0.3);

            orbit(mars, 0.05);

            moveShip();
        }

        function render(){
            //game.debug.spriteInfo(earth, 32, 32);
        }

    };
