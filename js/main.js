$( document ).ready(function() {

    var sun,
    mercury,
    venus,
    earth, moon,
    mars, deimos, phobos,
    jupiter, callisto, europa, ganymede, io,
    saturn, titan, dione, enceladus, rhea,
    uranus,
    neptune, triton,
    ship, emitter, keys;

    //Constants namespace
    var planetRevolutionRadius = 80;
    var consts = {
        "sWidth": window.innerWidth -20,
        "sHeight": window.innerHeight -200,
        "worldSizeX": 1500,
        "worldSizeY": 1500,
        "worldCenterX": 0,
        "worldCenterY": 0,
        "rotationSpeed": 0.5, //0.5 looks best at default scale.
        "revolutionSpeed": 15, //Global multiplier. Implemented in orbit(), can be changed in GUI.
        "angle": 3 * Math.PI / 180,
        "modAngle": 0,
        "baseScale": 1,
        "moonOffset": 25,
        "nthMoonOffset": 1.55,

        revolutionRadius: {
            "mercury": planetRevolutionRadius,
            "venus": planetRevolutionRadius*2,
            "earth": planetRevolutionRadius*3,
            "mars": planetRevolutionRadius*4,
            "jupiter": planetRevolutionRadius*5,
            "saturn": planetRevolutionRadius*6,
            "uranus": planetRevolutionRadius*7,
            "neptune": planetRevolutionRadius*8
        },
        ship: {
            direction: {
                "up": 0,
                "down": 180,
                "left": 270,
                "right": 90
            },
            "speed": 350
        }
    };


    var game = new Phaser.Game(consts.sWidth, consts.sHeight, Phaser.AUTO, "canvas",
        { preload: preload, create: create, update: update });

    function preload(){
        game.load.image("space", "img/background.jpg");
        game.load.image("sun", "img/Sun.png");
        game.load.image("shadow", "img/shadow.png");

        game.load.image("mercury", "img/Mercury.png");
        game.load.image("venus", "img/Venus.png");

        game.load.image("earth", "img/Earth/Earth.png");
        game.load.image("moon", "img/Earth/Moon.png");

        game.load.image("mars", "img/Mars/Mars.png");
        game.load.image("deimos", "img/Mars/Deimos.png");
        game.load.image("phobos", "img/Mars/Phobos.png");

        game.load.image("jupiter", "img/Jupiter/Jupiter.png");
        game.load.image("callisto", "img/Jupiter/Moons/Callisto.png");
        game.load.image("europa", "img/Jupiter/Moons/Europa.png");
        game.load.image("ganymede", "img/Jupiter/Moons/Ganymede.png");
        game.load.image("io", "img/Jupiter/Moons/Io.png");

        game.load.image("saturn", "img/Saturn/Saturn.png");
        game.load.image("titan", "img/Saturn/Moons/Titan.png");
        game.load.image("dione", "img/Saturn/Moons/Dione.png");
        game.load.image("enceladus", "img/Saturn/Moons/Enceladus.png");
        game.load.image("rhea", "img/Saturn/Moons/Rhea.png");

        game.load.image("uranus", "img/Uranus/Uranus.png");

        game.load.image("neptune", "img/Neptune/Neptune.png");
        game.load.image("triton", "img/Neptune/Triton.png");

        game.load.image("ship", "img/SpaceshipAbove.png");
        game.load.image("particle", "img/particle.jpg");
        game.load.image("keys", "img/keys.png");
    }

    function toggleAllMoons(){
        if($("#toggleMoons").is(':checked')){
            //Jupiter has 53 moons. 4 always on, 49 toggleable.
            addMoons(49, jupiter);
            //Saturn also has 53 moons, 4 always on.
            addMoons(49, saturn);
            //Uranus has 27 moons, 0 default.
            addMoons(27, uranus);
            //Neptune has 13 moons, 1 always on.
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
            var randomOffset = consts.moonOffset*consts.nthMoonOffset+i * Math.random();
            planet.moons.push(new celestialBody(randomMoon, planet.center, randomOffset, -randSpeed) );
        };
    };


    function celestialBody(sprite, revolveAround, revolutionRadius, revSpeed) {
        // Planets start at different positions by changing the starting angle each time one is created.
        var angleMod = (consts.modAngle +=1);
        this.sprite = game.add.sprite(consts.worldCenterX, consts.worldCenterY, sprite);
        // Center of the sprite
        var centerAnchor = 0.5;
        this.sprite.anchor.setTo(centerAnchor, centerAnchor);
        // Each body must have its own rotAngle to have a different speed.
        this.rotAngle = consts.angle + angleMod;
        // Point to revolve around, sun for planets, planet for moons.
        this.revolveAround = revolveAround;
        // We will be seen but not be heard, We are
        this.revolutionRadius = revolutionRadius;
        // Shadow. Attach to planet after moons are created, so it can cover them.
        this.center;
        this.shadow;
        this.moons = [];
        this.revolutionSpeed = revSpeed;
    }
    celestialBody.prototype.addShadow = function(alpha, scaleX, scaleY){
        //If not specified, the shadow is roughly the size of earth.
        if (!scaleX) {scaleX = consts.baseScale};
        if (!scaleY) {scaleY = consts.baseScale};
        this.shadow = game.add.sprite(consts.orldCenterX, consts.worldCenterY, "shadow");
        //Anchor must be 1, 0.5 to cover half of the body.
        this.shadow.anchor.setTo(1, 0.5);
        //Shadow's transparency
        this.shadow.alpha = alpha;
        this.shadow.scale.setTo(scaleX,scaleY);
    }

    function nthMoon(n){
        return consts.moonOffset*consts.nthMoonOffset*n;
    }

    function create(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.tileSprite(0, 0, consts.worldSizeX, consts.worldSizeY, "space");
        game.world.setBounds(0, 0, consts.worldSizeX, consts.worldSizeY);
        consts.worldCenterX = game.world.centerX;
        consts.worldCenterY = game.world.centerY;

        //The sun doesn't need other parameters
        sun = new celestialBody("sun");
        var sunCenter = {"x": sun.sprite.position.x, "y": sun.sprite.position.y};

        mercury = new celestialBody("mercury", sunCenter, consts.revolutionRadius.mercury);
        mercury.addShadow(0.5);

        venus = new celestialBody("venus", sunCenter, consts.revolutionRadius.venus);
        venus.addShadow(0.5);

        earth = new celestialBody("earth", sunCenter, consts.revolutionRadius.earth);
        var earthCenter = {"x": earth.sprite.position.x, "y": earth.sprite.position.y};

        moon = new celestialBody("moon", earthCenter, consts.moonOffset);
        moon.addShadow(0.3, consts.baseScale, 0.2);
        //Earth's shadow is after the moon, since it has to cover it.
        earth.addShadow(0.4);

        mars = new celestialBody("mars", sunCenter, consts.revolutionRadius.mars);
        var marsCenter = {"x": mars.sprite.position.x, "y": mars.sprite.position.y};
        phobos = new celestialBody("phobos", marsCenter, consts.moonOffset);
        phobos.addShadow(0.15, consts.baseScale, 0.2);
        deimos = new celestialBody("deimos", marsCenter, nthMoon(1));
        deimos.addShadow(0.15, consts.baseScale, 0.2);
        mars.addShadow(0.2, 0.8, consts.baseScale);

        /*Gas giants without shadow, style choice.*/
        jupiter = new celestialBody("jupiter", sunCenter, consts.revolutionRadius.jupiter);
        jupiter.center = {"x": jupiter.sprite.position.x, "y": jupiter.sprite.position.y};
        callisto = new celestialBody("callisto", jupiter.center, nthMoon(0.9) );
        europa = new celestialBody("europa", jupiter.center, nthMoon(1.1) );
        ganymede = new celestialBody("ganymede", jupiter.center, nthMoon(1.2) );
        io = new celestialBody("io", jupiter.center, nthMoon(1.3) );

        saturn = new celestialBody("saturn", sunCenter, consts.revolutionRadius.saturn);
        var saturnCenter = {"x": saturn.sprite.position.x, "y": saturn.sprite.position.y};
        titan = new celestialBody("titan", saturnCenter, nthMoon(0.9) );
        dione = new celestialBody("dione", saturnCenter, nthMoon(1.1) );
        enceladus = new celestialBody("enceladus", saturnCenter, nthMoon(1.2) );
        rhea = new celestialBody("rhea", saturnCenter, nthMoon(1.3) );

        uranus = new celestialBody("uranus", sunCenter, consts.revolutionRadius.uranus);

        neptune = new celestialBody("neptune", sunCenter, consts.revolutionRadius.neptune);
        var neptuneCenter = {"x": neptune.sprite.position.x, "y": neptune.sprite.position.y};
        triton = new celestialBody("triton", neptuneCenter, consts.moonOffset);

        //Ship
        var shipStartX = consts.worldCenterX;
        var shipStartY = consts.worldCenterY+100;
        ship = game.add.sprite(shipStartX, shipStartY, "ship"); //Arbitrary position near center.
        ship.anchor.setTo(0.5, 0.5); //Ship is moved from its center.
        game.physics.arcade.enable(ship); //Physics needed to enable collision with world bounds.
        ship.body.collideWorldBounds = true;
        cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(ship);

        //Engine particles emitter.
        var particlesDensity = 200;
        emitter = game.add.emitter(shipStartX, shipStartY, particlesDensity);
        //Width and height of the ship's engine.
        emitter.width = 10;
        emitter.height = 10;
        emitter.particleSpeed = 200;
        emitter.makeParticles("particle");
        emitter.minParticleSpeed.set(0, emitter.particleSpeed);
        emitter.maxParticleSpeed.set(0, emitter.particleSpeed);
        emitter.gravity = 0;
        var trailX = 300;
        var trailY = 10;
        emitter.start(false, trailX, trailY);
        //Flashing keys image to show the ship can move.
        keys = game.add.sprite(shipStartX, shipStartY+100, "keys");
        keys.anchor.setTo(0.5, 0.5);
    }

    function flashSprite(sprite){
        if (!sprite) {return;};
        sprite.alpha += 0.015;
    }
    function destroyKeys(){
        if (!keys) {return;};
        keys.destroy();
        keys = false;
    }

    function moveShip(){
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;

        emitter.emitY = ship.y;
        emitter.emitX = ship.x;

        if (cursors.up.isDown)
        {
            destroyKeys();
            ship.angle = consts.ship.direction.up;
            ship.body.velocity.y = -consts.ship.speed;

            emitter.minParticleSpeed.set(0, emitter.particleSpeed);
            emitter.maxParticleSpeed.set(0, emitter.particleSpeed);
        }
        else if (cursors.down.isDown)
        {
            destroyKeys();
            ship.angle = consts.ship.direction.down;
            ship.body.velocity.y = consts.ship.speed;

            emitter.minParticleSpeed.set(0, -emitter.particleSpeed);
            emitter.maxParticleSpeed.set(0, -emitter.particleSpeed);
        }
        if (cursors.left.isDown)
        {
            destroyKeys();
            ship.angle = consts.ship.direction.left;
            ship.body.velocity.x = -consts.ship.speed;

            emitter.minParticleSpeed.set(emitter.particleSpeed, 0);
            emitter.maxParticleSpeed.set(emitter.particleSpeed, 0);
        }
        else if (cursors.right.isDown)
        {
            destroyKeys();
            ship.angle = consts.ship.direction.right;
            ship.body.velocity.x = consts.ship.speed;

            emitter.minParticleSpeed.set(-emitter.particleSpeed, 0);
            emitter.maxParticleSpeed.set(-emitter.particleSpeed, 0);
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
        daysToOrbitSun = daysToOrbitSun/consts.revolutionSpeed;
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
        //Rotation and revolution numbers are to scale, except where specified otherwise.
        //I don't know the revolution direction of the moons, this was just an aesthetic decision.

        //Rotation speed is divided by the length of the day in hours on each planet.
        mercury.sprite.rotation += consts.rotationSpeed / 1407;
        venus.sprite.rotation += consts.rotationSpeed / 2802;
        earth.sprite.rotation += consts.rotationSpeed / 24;
        mars.sprite.rotation += consts.rotationSpeed / 24.6;

        //Revolution speeds of planets based on one year length on earth.
        //The magic numbers are the number of earth days to complete a revolution.
        orbit(mercury, -88);
        orbit(venus, -224);

        orbit(earth, -365);
        orbit(moon, 27, earth);

        //Mars's year is about twice as long as Earth's year.
        orbit(mars, -687);
        //Mars moons are about 20 times faster, but I slowed them down to make it look better ad default speed.
        orbit(deimos, 25, mars);
        orbit(phobos, 6, mars);

        orbit(jupiter, -4332);
        orbit(callisto, -11, jupiter);
        orbit(europa, 23, jupiter);
        orbit(ganymede, -19, jupiter);
        orbit(io, 15, jupiter);
        orbitDynamicalBodies(jupiter);

        orbit(saturn, -10759);
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
        flashSprite(keys);
    }

    $("#toggleMoons").click(toggleAllMoons);

    $("#revolutionSpeed").change(function() {
        consts.revolutionSpeed = $('#revolutionSpeed').val();
    });
});
