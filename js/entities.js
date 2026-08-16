const Entities = {

    // =========================================================
    // PLAYER
    // =========================================================

    initPlayer() {

        const {
            width,
            height
        } = GameState;

        const {
            baseSpeed,
            size,
            acceleration,
            friction
        } = CONFIG.player;


        GameState.player = {

            x: width / 2,
            y: height / 2,

            size,

            speed: baseSpeed,

            vx: 0,
            vy: 0,

            acceleration,

            friction,

            // Used by the existing AI system
            lastDeaths: [],

            recentCollectTimes: [],

            moveHistory: []

        };

    },


    // =========================================================
    // COLLECTIBLE
    // =========================================================

    spawnCollectible() {

        const {
            width,
            height
        } = GameState;

        const {
            size
        } = CONFIG.collectibles;


        GameState.collectibles.push({

            x: randRange(
                40,
                width - 40
            ),

            y: randRange(
                40,
                height - 40
            ),

            size,

            pulse:
                Math.random() *
                Math.PI *
                2,

            colorCycle: 0

        });

    },


    // =========================================================
    // ENEMY
    // =========================================================

    spawnEnemy() {

        const {
            width,
            height,
            difficulty
        } = GameState;

        const {
            baseSpeedMin,
            baseSpeedMax,
            size
        } = CONFIG.enemies;


        // -----------------------------------------
        // Select enemy intelligence type
        // -----------------------------------------

        const random =
            Math.random();

        let type =
            "chaser";


        if (
            random > 0.55
        ) {

            type =
                "predictor";

        }


        if (
            random > 0.80
        ) {

            type =
                "cutter";

        }


        // -----------------------------------------
        // Initial state
        // -----------------------------------------

        const state =
            "harmful";


        GameState.enemies.push({

            x: randRange(
                40,
                width - 40
            ),

            y: randRange(
                40,
                height - 40
            ),

            size,

            speed:
                randRange(
                    baseSpeedMin,
                    baseSpeedMax
                ) *
                difficulty,

            type,

            state

        });

    },


    // =========================================================
    // UPDATE PLAYER
    // =========================================================

    updatePlayer(keys) {

        const player =
            GameState.player;

        const {
            width,
            height
        } = GameState;


        if (!player) {
            return;
        }


        // -----------------------------------------
        // Movement input
        // -----------------------------------------

        let ax = 0;
        let ay = 0;


        if (
            keys["arrowup"] ||
            keys["w"]
        ) {

            ay -=
                player.acceleration;

        }


        if (
            keys["arrowdown"] ||
            keys["s"]
        ) {

            ay +=
                player.acceleration;

        }


        if (
            keys["arrowleft"] ||
            keys["a"]
        ) {

            ax -=
                player.acceleration;

        }


        if (
            keys["arrowright"] ||
            keys["d"]
        ) {

            ax +=
                player.acceleration;

        }


        // -----------------------------------------
        // Apply acceleration
        // -----------------------------------------

        player.vx += ax;

        player.vy += ay;


        // -----------------------------------------
        // Friction
        // -----------------------------------------

        player.vx *=
            player.friction;

        player.vy *=
            player.friction;


        // -----------------------------------------
        // Maximum speed
        // -----------------------------------------

        const speedMagnitude =
            Math.hypot(
                player.vx,
                player.vy
            );


        const maxSpeed =
            player.speed;


        if (
            speedMagnitude >
            maxSpeed
        ) {

            player.vx =
                (
                    player.vx /
                    speedMagnitude
                ) *
                maxSpeed;


            player.vy =
                (
                    player.vy /
                    speedMagnitude
                ) *
                maxSpeed;

        }


        // -----------------------------------------
        // Update position
        // -----------------------------------------

        player.x +=
            player.vx;

        player.y +=
            player.vy;


        // -----------------------------------------
        // Keep player inside arena
        // -----------------------------------------

        player.x =
            Math.max(
                player.size,
                Math.min(
                    width -
                    player.size,
                    player.x
                )
            );


        player.y =
            Math.max(
                player.size,
                Math.min(
                    height -
                    player.size,
                    player.y
                )
            );


        // -----------------------------------------
        // Store movement history
        // -----------------------------------------

        if (
            GameState.frames % 5 === 0
        ) {

            player.moveHistory.push({

                x: player.x,

                y: player.y,

                vx: player.vx,

                vy: player.vy

            });


            if (
                player.moveHistory.length >
                20
            ) {

                player.moveHistory.shift();

            }


            // -----------------------------------------
            // AI observation
            // -----------------------------------------

            if (
                typeof AI !== "undefined" &&
                typeof AI.observePlayer ===
                "function"
            ) {

                AI.observePlayer();

            }

        }

    },


    // =========================================================
    // PREDICT PLAYER POSITION
    // =========================================================

    predictPlayerPosition(lookAheadSec) {

        const player =
            GameState.player;

        const {
            width,
            height
        } = GameState;


        const lookAheadFrames =
            Math.max(
                1,
                Math.floor(
                    lookAheadSec *
                    60
                )
            );


        let estimatedVx = 0;

        let estimatedVy = 0;


        // -----------------------------------------
        // Use recent movement history
        // -----------------------------------------

        if (
            player.moveHistory.length >= 2
        ) {

            const last =
                player.moveHistory[
                    player.moveHistory.length - 1
                ];


            estimatedVx =
                last.vx;

            estimatedVy =
                last.vy;

        }
        else {

            estimatedVx =
                player.vx;

            estimatedVy =
                player.vy;

        }


        // -----------------------------------------
        // Predict future position
        // -----------------------------------------

        const futureX =
            player.x +
            estimatedVx *
            lookAheadFrames;


        const futureY =
            player.y +
            estimatedVy *
            lookAheadFrames;


        return {

            x:
                Math.max(
                    player.size,
                    Math.min(
                        width -
                        player.size,
                        futureX
                    )
                ),

            y:
                Math.max(
                    player.size,
                    Math.min(
                        height -
                        player.size,
                        futureY
                    )
                )

        };

    },


    // =========================================================
    // UPDATE ENEMIES
    // =========================================================

    updateEnemies() {

        const {
            enemies
        } = GameState;

        const player =
            GameState.player;


        if (!player) {
            return;
        }


        enemies.forEach(
            enemy => {

                // -----------------------------------------
                // Default target = player
                // -----------------------------------------

                let target = {

                    x: player.x,

                    y: player.y

                };


                // -----------------------------------------
                // Intelligent enemy targeting
                // -----------------------------------------

                if (
                    enemy.type ===
                    "predictor"
                ) {

                    target =
                        this.predictPlayerPosition(
                            0.45
                        );

                }


                if (
                    enemy.type ===
                    "cutter"
                ) {

                    target =
                        this.predictPlayerPosition(
                            0.25
                        );

                }


                // -----------------------------------------
                // Calculate direction
                // -----------------------------------------

                let dx =
                    target.x -
                    enemy.x;

                let dy =
                    target.y -
                    enemy.y;


                let distance =
                    Math.hypot(
                        dx,
                        dy
                    ) || 1;


                // -----------------------------------------
                // Small movement wobble
                // -----------------------------------------

                const wobble =
                    Math.sin(
                        GameState.frames *
                        0.05 +
                        enemy.x
                    ) *
                    0.2;


                dx += wobble;

                dy += wobble;


                distance =
                    Math.hypot(
                        dx,
                        dy
                    ) || 1;


                // -----------------------------------------
                // Move enemy
                // -----------------------------------------

                enemy.x +=
                    (
                        dx /
                        distance
                    ) *
                    enemy.speed;


                enemy.y +=
                    (
                        dy /
                        distance
                    ) *
                    enemy.speed;


                // -----------------------------------------
                // Player distance
                // -----------------------------------------

                const playerDistance =
                    Math.hypot(
                        player.x -
                        enemy.x,

                        player.y -
                        enemy.y
                    );


                // -----------------------------------------
                // Near-miss detection
                //
                // This does NOT affect scoring.
                // It is only AI observation.
                // -----------------------------------------

                const nearMissDistance =
                    player.size +
                    enemy.size +
                    35;


                if (
                    playerDistance <
                    nearMissDistance &&
                    playerDistance >=
                    player.size +
                    enemy.size
                ) {

                    if (
                        typeof AI !== "undefined" &&
                        typeof AI.recordNearMiss ===
                        "function"
                    ) {

                        AI.recordNearMiss();

                    }

                }


                // -----------------------------------------
                // Collision
                // -----------------------------------------

                if (
                    playerDistance <
                    player.size +
                    enemy.size
                ) {


                    // =====================================
                    // HARMFUL ENEMY
                    // =====================================

                    if (
                        enemy.state ===
                        "harmful"
                    ) {

                        Particles
                            .createDeathParticles(
                                player.x,
                                player.y
                            );


                        Game.endGame(
                            "CAUGHT BY A HUNTER"
                        );


                        return;

                    }


                    // =====================================
                    // SAFE ENEMY
                    // =====================================

                    else {

                        // ---------------------------------
                        // ORIGINAL SCORING
                        // DO NOT CHANGE
                        // ---------------------------------

                        GameState.score += 8;


                        // ---------------------------------
                        // AI observation
                        // ---------------------------------

                        if (
                            typeof AI !== "undefined" &&
                            typeof AI.recordSafeHit ===
                            "function"
                        ) {

                            AI.recordSafeHit();

                        }


                        // ---------------------------------
                        // Update UI
                        // ---------------------------------

                        const scoreElement =
                            document.getElementById(
                                "score-value"
                            );


                        if (scoreElement) {

                            scoreElement.textContent =
                                GameState.score;

                        }


                        // ---------------------------------
                        // Visual feedback
                        // ---------------------------------

                        Particles
                            .createSafeHitParticles(
                                enemy.x,
                                enemy.y
                            );


                        AI.showCenterMessage(
                            "Safe hit! +8"
                        );

                    }

                }

            }
        );

    },


    // =========================================================
    // CHECK COLLECTIBLES
    // =========================================================

    checkCollectibles() {

        const now =
            performance.now();

        const {
            collectibles,
            player
        } = GameState;

        const {
            scorePerPick
        } = CONFIG.collectibles;


        if (!player) {
            return;
        }


        // -----------------------------------------
        // Check every collectible
        // -----------------------------------------

        for (
            let index =
                collectibles.length - 1;

            index >= 0;

            index--
        ) {

            const collectible =
                collectibles[index];


            const distance =
                Math.hypot(

                    player.x -
                    collectible.x,

                    player.y -
                    collectible.y

                );


            // -----------------------------------------
            // Collection collision
            // -----------------------------------------

            if (
                distance <
                player.size +
                collectible.size
            ) {

                // -------------------------------------
                // ORIGINAL SCORING
                // DO NOT CHANGE
                // -------------------------------------

                GameState.score +=
                    scorePerPick;


                // -------------------------------------
                // AI observation
                // -------------------------------------

                if (
                    typeof AI !== "undefined" &&
                    typeof AI.recordCollection ===
                    "function"
                ) {

                    AI.recordCollection();

                }


                // -------------------------------------
                // Store collection time
                // -------------------------------------

                player.recentCollectTimes.push(
                    now
                );


                if (
                    player.recentCollectTimes.length >
                    20
                ) {

                    player.recentCollectTimes.shift();

                }


                // -------------------------------------
                // Update score UI
                // -------------------------------------

                const scoreElement =
                    document.getElementById(
                        "score-value"
                    );


                if (scoreElement) {

                    scoreElement.textContent =
                        GameState.score;

                }


                // -------------------------------------
                // Collection particles
                // -------------------------------------

                Particles
                    .createCollectParticles(
                        collectible.x,
                        collectible.y
                    );


                // -------------------------------------
                // Remove collected node
                // -------------------------------------

                collectibles.splice(
                    index,
                    1
                );


                // -------------------------------------
                // Spawn replacement
                // -------------------------------------

                this.spawnCollectible();


                // -------------------------------------
                // Difficulty increase
                //
                // ORIGINAL SYSTEM PRESERVED
                // -------------------------------------

                if (
                    GameState.score % 50 ===
                    0
                ) {

                    GameState.difficulty =
                        Math.min(
                            2.4,
                            GameState.difficulty +
                            0.18
                        );


                    this.spawnEnemy();


                    if (
                        typeof AI !== "undefined"
                    ) {

                        AI.updateCoachHint(
                            "harder"
                        );


                        AI.showCenterMessage(
                            "Difficulty increased"
                        );

                    }

                }

            }

        }

    }

};