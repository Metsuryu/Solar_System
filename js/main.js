$( document ).ready(function() {
        //TODO: Find best size after GUI is done
        //TODO: Put all constants and magic numbers in an object at the top of the file.
        var sWidth = window.innerWidth -20;
        var sHeight = window.innerHeight -100; 

        var game = new Phaser.Game(sWidth, sHeight, Phaser.AUTO, "canvas", 
            { preload: preload, create: create, update: update });

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
            game.load.image("io", "img/Jupiter/Moons/Io.jpg");

            game.load.image("saturn", "img/Saturn/Saturn.jpg");
            game.load.image("titan", "img/Saturn/Moons/Titan.jpg");
            game.load.image("dione", "img/Saturn/Moons/Dione.jpg");
            game.load.image("enceladus", "img/Saturn/Moons/Enceladus.jpg");
            game.load.image("rhea", "img/Saturn/Moons/Rhea.jpg");
                                               
            game.load.image("uranus", "img/Uranus/Uranus.jpg");

            game.load.image("neptune", "img/Neptune/Neptune.jpg");
            game.load.image("triton", "img/Neptune/Triton.jpg");

            game.load.image("ship", "img/SpaceshipAbove.png");
        }

        function toggleAllMoons(){
            //Jupiter has 53 moons. 4 always on, 49 toggleable.
            //Saturn also has 53 moons, 4 always on.
            //Uranus has 27 moons, 0 default.
            //Neptune has 13 moons, 1 always on.
            if($("#toggleMoons").is(':checked')){
                addMoons(49, jupiter);
                addMoons(49, saturn);
                addMoons(27, uranus);
                addMoons(12, neptune);

            }else{
                removeMoons(jupiter);
                removeMoons(saturn);
                removeMoons(uranus);
                removeMoons(neptune);
            }            
        }

        function removeMoons(planet){
            for (var i = planet.moons.length - 1; i >= 0; i--) {
                planet.moons[i].sprite.destroy();
            }
            planet.moons = [];
        }

        function addMoons(quantity, planet){
            for (var i = 0; i < quantity; i++) {
                //Randomize the sprite of dynamically generated moon from ones available.
                var moonsSprites = ["moon", "deimos", "phobos", "callisto", "europa", "ganymede"];
                var randomMoon = moonsSprites[ randomInt(0, moonsSprites.length) ];
                //Random speed and offset
                var randSpeed = randomInt(10, 20);
                var randomOffset = moonOffset*nthMoonOffset+i * Math.random();
                planet.moons.push(new celestialBody(randomMoon, planet.center, randomOffset, -randSpeed) );
            };
        };

        var sun, 
        mercury, 
        venus, 
        earth, moon, 
        mars, deimos, phobos, 
        jupiter, callisto, europa, ganymede, io,
        saturn, titan, dione, enceladus, rhea,
        uranus,
        neptune, triton;

        var rotationSpeed = 0.5; //0.5 looks best at default scale. 
        var revolutionSpeed = 15; //Global multiplier. Implemented in orbit(), can be changed in GUI.
        var ship;
        var angle = 3 * Math.PI / 180;
        var modAngle = 0;

        var baseScale = 1;
        var worldCenterX;
        var worldCenterY;
        var planetRevolutionRadius = 80;
        var moonOffset = 25;
        var nthMoonOffset = 1.55;

        var jupiterCenter;

        function celestialBody(sprite, revolveAround, revolutionRadius, revSpeed) {
            //Panets start at different positions by changing starting angle each time one is created.
            var angleMod = (modAngle +=1);
            this.sprite = game.add.sprite(worldCenterX, worldCenterY, sprite);
            //Center of the sprite
            var centerAnchor = 0.5;
            this.sprite.anchor.setTo(centerAnchor, centerAnchor);
            //Each body must have own rotAngle to have different speed.
            this.rotAngle = angle + angleMod;
            //Point to revolve around, sun for planets, planet for moons.
            this.revolveAround = revolveAround;
            //We will be seen but not be heard, We are
            this.revolutionRadius = revolutionRadius;
            //Shadow. Attach to planet after moon are created, so it can cover them.
            this.center;
            this.shadow;
            this.moons = [];
            this.revolutionSpeed = revSpeed;
        }
        celestialBody.prototype.addShadow = function(alpha, scaleX, scaleY){
            //If not specified, the shadow is roughly the size of earth.
            if (!scaleX) {scaleX = baseScale};
            if (!scaleY) {scaleY = baseScale};
            this.shadow = game.add.sprite(worldCenterX, worldCenterY, "shadow");
            //Anchor must be 1, 0.5 to cover half of the body.
            this.shadow.anchor.setTo(1, 0.5);
            //Shadow's transparency
            this.shadow.alpha = alpha;
            this.shadow.scale.setTo(scaleX,scaleY);
        }

        function create(){
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //TODO: Maybe add a starry space background instead of pure black
            //game.stage.backgroundColor = "#4488AA";
            //TODO: Adjust bounds
            game.world.setBounds(0, 0, 1500, 1500);            
            worldCenterX = game.world.centerX;
            worldCenterY = game.world.centerY;

            //The sun doesn't need other parameters
            sun = new celestialBody("sun");
            var sunCenter = {"x": sun.sprite.position.x, "y": sun.sprite.position.y};

            mercury = new celestialBody("mercury", sunCenter, planetRevolutionRadius);
            mercury.addShadow(0.5);

            venus = new celestialBody("venus", sunCenter, planetRevolutionRadius*2);
            venus.addShadow(0.5);

            earth = new celestialBody("earth", sunCenter,planetRevolutionRadius*3);
            var earthCenter = {"x": earth.sprite.position.x, "y": earth.sprite.position.y};

            moon = new celestialBody("moon", earthCenter, moonOffset);
            moon.addShadow(0.3, baseScale, 0.2);
            //Earth's shadow is after the moon, since it has to cover it.
            earth.addShadow(0.4);

            mars = new celestialBody("mars", sunCenter, planetRevolutionRadius*4);
            var marsCenter = {"x": mars.sprite.position.x, "y": mars.sprite.position.y};
            phobos = new celestialBody("phobos", marsCenter, moonOffset);
            phobos.addShadow(0.15, baseScale, 0.2);
            deimos = new celestialBody("deimos", marsCenter, moonOffset*nthMoonOffset);
            deimos.addShadow(0.15, baseScale, 0.2);
            mars.addShadow(0.2, 0.8, baseScale);

            /*Gas giants without shadow, style choice.*/
            jupiter = new celestialBody("jupiter", sunCenter, planetRevolutionRadius*5);
            jupiter.center = {"x": jupiter.sprite.position.x, "y": jupiter.sprite.position.y};
            callisto = new celestialBody("callisto", jupiter.center, moonOffset*nthMoonOffset*0.9);
            europa = new celestialBody("europa", jupiter.center, moonOffset*nthMoonOffset*1.1);
            ganymede = new celestialBody("ganymede", jupiter.center, moonOffset*nthMoonOffset*1.2);
            io = new celestialBody("io", jupiter.center, moonOffset*nthMoonOffset*1.3);

            saturn = new celestialBody("saturn", sunCenter, planetRevolutionRadius*6);
            var saturnCenter = {"x": saturn.sprite.position.x, "y": saturn.sprite.position.y};
            titan = new celestialBody("titan", saturnCenter, moonOffset*nthMoonOffset*0.9);
            dione = new celestialBody("dione", saturnCenter, moonOffset*nthMoonOffset*1.1);
            enceladus = new celestialBody("enceladus", saturnCenter, moonOffset*nthMoonOffset*1.2);
            rhea = new celestialBody("rhea", saturnCenter, moonOffset*nthMoonOffset*1.3);

            uranus = new celestialBody("uranus", sunCenter, planetRevolutionRadius*7);

            neptune = new celestialBody("neptune", sunCenter, planetRevolutionRadius*8);
            var neptuneCenter = {"x": saturn.sprite.position.x, "y": saturn.sprite.position.y};
            triton = new celestialBody("triton", neptuneCenter, moonOffset);

            //TODO: Maybe remove, or make a transparent sprite for camera movement
            ship = game.add.sprite(worldCenterX, worldCenterY+100, "ship");
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
                ship.angle = 0;
                ship.body.velocity.y = -350;
            }
            else if (cursors.down.isDown)
            {
                ship.angle = 180;
                ship.body.velocity.y = 350;
            }
            if (cursors.left.isDown)
            {
                ship.angle = 270;                
                ship.body.velocity.x = -350;
            }
            else if (cursors.right.isDown)
            {
                ship.angle = 90;
                ship.body.velocity.x = 350;
            }
        }
        function randomInt(min, max) {
            return Math.floor((Math.random() * max) + min);
        }

        function orbit(planet, daysToOrbitSun, orbitAround){
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
            /*daysToOrbitSun is the base revolution speed of the planets, and it is multiplied by the gloabl
            revolutionSpeed to get the actual speed.
            A higher value means a slower speed.*/
            daysToOrbitSun = daysToOrbitSun/revolutionSpeed;
            // increase the angle of rotation at each frame
            planet.rotAngle += (3 * Math.PI / 180)/daysToOrbitSun;
           
            var newX = planet.revolveAround.x + planet.revolutionRadius * Math.cos(planet.rotAngle);
            var newY = planet.revolveAround.y + planet.revolutionRadius * Math.sin(planet.rotAngle);

            planet.sprite.x = newX;
            planet.sprite.y = newY;
        }

        function orbitDynamicalBodies(planet){
            if (!planet || !planet.moons || !planet.moons.length) {
                return;
            };
            for (var i = planet.moons.length - 1; i >= 0; i--) {
                orbit(planet.moons[i], planet.moons[i].revolutionSpeed, planet);
            }
        }

        function update(){
            //All rotation and revolution numbers are to scale (except where specified otherwise.)

            /*TODO: Maybe just call orbit on all celestial bodies with a loop, 
            and have orbit() get the speed and direction of orbit from 
            planet.orbitspeed (to add) instead of using a parameter.
            */
            //The magic number is the length of the day in hours on each planet.
            mercury.sprite.rotation += rotationSpeed/1407;
            venus.sprite.rotation += rotationSpeed/2802;
            earth.sprite.rotation += rotationSpeed/24;
            mars.sprite.rotation += rotationSpeed/24.6;

            //Revolution speeds of planets based on year length on earth.
            //The magic number is the number of earth days to complete a revolution.

            orbit(mercury, -88);
            orbit(venus, -224);

            orbit(earth, -365);
                orbit(moon, 27, earth);

            //Mars's year is about twice as long as Earth's year.
            orbit(mars, -687);
            //Mars moons are 20 times faster, but I slowed them down to make it look better ad default speed.
                orbit(deimos, 25, mars);
                orbit(phobos, 6, mars);

            //I don't know the revolution direction of Jupiter's moons, this was just an aesthetic decision.
            orbit(jupiter, -4332);
                orbit(callisto, -11, jupiter);
                orbit(europa, 23, jupiter);
                orbit(ganymede, -19, jupiter);
                orbit(io, 15, jupiter);
                //TODO: Add the rest of the moons here, and to the other planets.
                orbitDynamicalBodies(jupiter);

            orbit(saturn, -10759);
            /*titan, dione, enceladus, rhea*/
                orbit(titan, -11, saturn);
                orbit(dione, 23, saturn);
                orbit(enceladus, -19, saturn);
                orbit(rhea, 15, saturn);
                orbitDynamicalBodies(saturn);

            orbit(uranus, -30688);
            orbitDynamicalBodies(uranus);

            orbit(neptune, -60182);
                orbit(triton, 15, neptune);
            orbitDynamicalBodies(neptune);

            moveShip();
        }

        //TODO: Make it a toggle, to add or remove extra moons.
        $("#toggleMoons").click(toggleAllMoons);

        $("#revolutionSpeed").change(function() {
            revolutionSpeed = $('#revolutionSpeed').val();
        });
    
});
