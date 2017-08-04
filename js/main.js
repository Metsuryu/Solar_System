    window.onload = function() {
        //TODO: Find best size after GUI is done
        var sWidth = window.innerWidth -10;
        var sHeight = window.innerHeight -100; 

        var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, "canvas", 
            { preload: preload, create: create, update: update, render: render });

        function preload(){

            game.load.image("sun", "img/Sun.jpg");
            game.load.image("shadow", "img/Shadow.png");

            game.load.image("mercury", "img/Mercury.jpg");
            game.load.image("venus", "img/Venus.jpg");

            game.load.image("earth", "img/Earth/Earth.jpg");
            game.load.image("moon", "img/Earth/Moon.jpg");

            game.load.image("mars", "img/Mars/Mars.jpg");
            game.load.image("deimos", "img/Mars/Deimos.jpg");
            game.load.image("phobos", "img/Mars/Phobos.jpg");

            game.load.image("jupiter", "img/Jupiter/Jupiter.jpg");
            game.load.image("callisto", "img/Jupiter/Moons/Callisto.jpg");
            game.load.image("europa", "img/Jupiter/Moons/Europa.jpg");
            game.load.image("ganymede", "img/Jupiter/Moons/Ganymede.jpg");
            game.load.image("rhea", "img/Jupiter/Moons/Rhea.jpg");

            game.load.image("saturn", "img/Saturn/Saturn.jpg");
            game.load.image("titan", "img/Saturn/Moons/Titan.jpg");
            game.load.image("dione", "img/Saturn/Moons/Dione.jpg");
            game.load.image("enceladus", "img/Saturn/Moons/Enceladus.jpg");
            game.load.image("rhea", "img/Saturn/Moons/Rhea.jpg");
                                               
            game.load.image("uranus", "img/Uranus/Uranus.jpg");

            game.load.image("neptune", "img/Neptune/Neptune.jpg");
            game.load.image("triton", "img/Neptune/Triton.jpg");

            game.load.image("ship", "img/Spaceship.png");
        }

        var sun, 
        mercury, 
        venus, 
        earth, moon, 
        mars, deimos, phobos, 
        jupiter, callisto, europa, ganymede, io,
        saturn, titan, dione, enceladus, rhea,
        uranus,
        neptune, triton;
        //Completely arbitrary rotation speed. TODO: Maybe pick it by some logic.
        var rotationSpeed = 0.021;
        var revolutionSpeed = 1; //TODO: Multiplier. Implemented in orbit(), maybe make a GUI to change it.
        var ship;
        var angle = 3 * Math.PI / 180;
        var modAngle = 0;


        function celestialBody(sprite, spriteX, spriteY, anchorX, anchorY, revolveAround, revolutionRadius) {
            //TODO: Optimize celestialBody. Remove need for spriteX, spriteY, anchorX, anchorY.
            //TODO: Add "moons" parameter, so I can add moons simply by passing an object with sprites there.
            //Panets start at different positions by changing starting angle each time one is created.
            angleMod = (modAngle +=1);

            this.sprite = game.add.sprite(spriteX, spriteY, sprite);
            //Center of the sprite
            this.sprite.anchor.setTo(anchorX, anchorY);
            //Each body must have own rotAngle to have different speed.
            this.rotAngle = angle + angleMod;
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
            //TODO: Maybe add a starry space background instead of pure black
            //game.stage.backgroundColor = "#4488AA";
            //TODO: Adjust bounds
            game.world.setBounds(0, 0, 1500, 1500);
            
            var planetRevolutionRadius = 80;
            var moonOffset = 25;
            var nthMoonOffset = 1.55;
            var centerAnchorX = 0.5;
            var centerAnchorY = 0.5;
            var baseScale = 1;

            var worldCenterX = game.world.centerX;
            var worldCenterY = game.world.centerY;

            sun = new celestialBody(
                "sun",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY
                //The sun doesn't need other parameters
            );

            var sunX = sun.sprite.position.x;
            var sunY = sun.sprite.position.y;
            var sunCenter = {"x": sunX, "y": sunY };

            mercury = new celestialBody(
                "mercury",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius
            );
            var mercuryShadowAlpha = 0.5;
            mercury.addShadow(
                worldCenterX, worldCenterY,
                mercuryShadowAlpha,
                baseScale, baseScale
            );

            venus = new celestialBody(
                "venus",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*2
            );
            var venusShadowAlpha = 0.5;
            venus.addShadow(
                worldCenterX, worldCenterY,
                venusShadowAlpha,
                baseScale, baseScale
            );

            earth = new celestialBody(
                "earth",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*3
            );

            var earthCenter = {"x": earth.sprite.position.x, "y": earth.sprite.position.y };

            moon = new celestialBody(
                "moon",
                earth.sprite.position.x, worldCenterY,
                centerAnchorX, centerAnchorY,
                earthCenter,
                moonOffset
            );

            var moonShadowAlpha = 0.3;
            var moonShadowScaleY = 0.2;
            moon.addShadow(
                earth.sprite.position.x, worldCenterY,
                moonShadowAlpha,
                baseScale, moonShadowScaleY
            );

            var earthShadowAlpha = 0.4;
            //Earth's shadow is after the moon, since it has to cover it.
            earth.addShadow(
                worldCenterX, worldCenterY,
                earthShadowAlpha,
                baseScale, baseScale
            );

            mars = new celestialBody(
                "mars",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*4
            );
            var marsCenter = {"x": mars.sprite.position.x, "y": mars.sprite.position.y };
            deimos = new celestialBody(
                "deimos",
                mars.sprite.position.x, worldCenterY,
                centerAnchorX, centerAnchorY,
                marsCenter,
                moonOffset
            );
            var deimosShadowAlpha = 0.15;
            var deimosShadowScaleY = 0.2;
            deimos.addShadow(
                mars.sprite.position.x, worldCenterY,
                deimosShadowAlpha,
                baseScale, deimosShadowScaleY
            );
            phobos = new celestialBody(
                "phobos",
                mars.sprite.position.x, worldCenterY,
                centerAnchorX, centerAnchorY,
                marsCenter,
                moonOffset*nthMoonOffset
            );
            var phobosShadowAlpha = 0.15;
            var phobosShadowScaleY = 0.2;
            phobos.addShadow(
                mars.sprite.position.x, worldCenterY,
                phobosShadowAlpha,
                baseScale, phobosShadowScaleY
            );
            var marsShadowAlpha = 0.2;
            var marsShadowScaleX = 0.8;
            mars.addShadow(
                worldCenterX, worldCenterY,
                marsShadowAlpha,
                marsShadowScaleX, baseScale
            );


            jupiter = new celestialBody(
                "jupiter",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*5
            );

            saturn = new celestialBody(
                "saturn",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*6
            );            
            uranus = new celestialBody(
                "uranus",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*7
            );
            neptune = new celestialBody(
                "neptune",
                worldCenterX, worldCenterY,
                centerAnchorX, centerAnchorY,
                sunCenter,
                planetRevolutionRadius*8
            );
            //TODO: Jupiter has 53 moons. Make 4 always on, and 49 toggleable on (off by default).
            //TODO: Also, make toggleable asteroid belts.
            //TODO: Saturn also has 53 moons. Use 8 always on, and the rest toggleable.
            //TODO: Uranus has 27 moons.
            //TODO: Neptune has 13 moons.

            //TODO: Maybe remove, or make a transparent sprite for camera movement
            ship = game.add.sprite(worldCenterX, worldCenterY+100, "ship");
            ship.anchor.setTo(centerAnchorX, centerAnchorY);
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

        function orbit(planet, orbitSpeed, orbitAround){
            if (!planet) {return;};

            //If it's a moon, make it follow its planet (orbitAround).
            if (orbitAround) {
                planet.revolveAround = {"x": orbitAround.sprite.position.x, "y": orbitAround.sprite.position.y };
            };

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
            /*TODO: Just call orbit on all celestial bodies with a loop, 
            and have orbit() get the speed and direction of orbit from 
            planet.orbitspeed (to add) instead of using a parameter.
            */
            mercury.sprite.rotation += rotationSpeed;
            venus.sprite.rotation += rotationSpeed;
            earth.sprite.rotation += rotationSpeed;
            mars.sprite.rotation += rotationSpeed;

            //TODO: Calculate speeds of new planets based on year lenght.
            orbit(mercury, -0.21);
            orbit(venus, -0.11);

            orbit(earth, -0.1);
            orbit(moon, 0.3, earth);

            //Mars's year is about twice as long as Earth's year.
            orbit(mars, -0.053);
            orbit(deimos, 0.42, mars);
            orbit(phobos, 0.14, mars);

            //TODO: Adjust speeds
            orbit(jupiter, -0.023);
            orbit(saturn, -0.023);
            orbit(uranus, -0.023);
            orbit(neptune, -.023);
/*
            //TODO: Orbit dynamically generated moons
            for (var i = Things.length - 1; i >= 0; i--) {
                Things[i]
            }
*/


            moveShip();
        }

        function render(){
            //game.debug.spriteInfo(earth, 32, 32);
        }

    };
