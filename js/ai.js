const AI = {

    // ==========================================
    // ENEMY STATE MEMORY
    // ==========================================

    enemyStateTimers: new Map(),


    // ==========================================
    // AI MEMORY
    // ==========================================

    metrics: {

        collections: 0,

        safeHits: 0,

        nearMisses: 0,

        enemyEncounters: 0,

        movementDistance: 0,

        lastX: null,

        lastY: null,

        aggressiveMovement: 0,

        preferredSide: "center",

        lastCollectionTime: 0,

        sessionStart: 0

    },


    // ==========================================
    // INITIALIZE
    // ==========================================

    init() {

        this.enemyStateTimers.clear();

        this.metrics = {

            collections: 0,

            safeHits: 0,

            nearMisses: 0,

            enemyEncounters: 0,

            movementDistance: 0,

            lastX: null,

            lastY: null,

            aggressiveMovement: 0,

            preferredSide: "center",

            lastCollectionTime: performance.now(),

            sessionStart: performance.now()

        };

    },


    // ==========================================
    // RECORD COLLECTION
    // ==========================================

    recordCollection() {

        this.metrics.collections++;

        this.metrics.lastCollectionTime =
            performance.now();

    },


    // ==========================================
    // RECORD SAFE HIT
    // ==========================================

    recordSafeHit() {

        this.metrics.safeHits++;

    },


    // ==========================================
    // RECORD NEAR MISS
    // ==========================================

    recordNearMiss() {

        this.metrics.nearMisses++;

    },


    // ==========================================
    // OBSERVE PLAYER
    // ==========================================

    observePlayer() {

        const player =
            GameState.player;

        if (!player) {
            return;
        }


        // ------------------------------------------
        // Movement distance
        // ------------------------------------------

        if (
            this.metrics.lastX !== null
        ) {

            const dx =
                player.x -
                this.metrics.lastX;

            const dy =
                player.y -
                this.metrics.lastY;

            const distance =
                Math.hypot(dx, dy);

            this.metrics.movementDistance +=
                distance;


            // Fast movement = aggressive style

            if (distance > 4) {

                this.metrics.aggressiveMovement++;

            }

        }


        this.metrics.lastX =
            player.x;

        this.metrics.lastY =
            player.y;


        // ------------------------------------------
        // Preferred side
        // ------------------------------------------

        const center =
            GameState.width / 2;

        if (
            player.x <
            center - 100
        ) {

            this.metrics.preferredSide =
                "left";

        }
        else if (
            player.x >
            center + 100
        ) {

            this.metrics.preferredSide =
                "right";

        }
        else {

            this.metrics.preferredSide =
                "center";

        }

    },


    // ==========================================
    // PLAYER PERFORMANCE
    // ==========================================

    getPerformance() {

        const elapsed =
            Math.max(
                1,
                (performance.now() -
                    this.metrics.sessionStart) /
                1000
            );


        const collectionRate =
            this.metrics.collections /
            elapsed;


        const aggressiveRatio =
            this.metrics.aggressiveMovement /
            Math.max(
                1,
                GameState.frames / 5
            );


        const timeSinceCollection =
            performance.now() -
            this.metrics.lastCollectionTime;


        return {

            collectionRate,

            aggressiveRatio,

            timeSinceCollection,

            safeHits:
                this.metrics.safeHits,

            nearMisses:
                this.metrics.nearMisses,

            preferredSide:
                this.metrics.preferredSide

        };

    },


    // ==========================================
    // DETERMINE PLAYER STYLE
    // ==========================================

    getPlayerStyle() {

        const performance =
            this.getPerformance();


        if (
            performance.aggressiveRatio >
            0.35
        ) {

            return "aggressive";

        }


        if (
            performance.collectionRate >
            0.10
        ) {

            return "collector";

        }


        if (
            performance.timeSinceCollection >
            7000
        ) {

            return "struggling";

        }


        return "balanced";

    },


    // ==========================================
    // ADAPTIVE ENEMY AI
    // ==========================================

    updateEnemyStates() {

        const {
            ai
        } = CONFIG;


        const performance =
            this.getPerformance();


        const playerStyle =
            this.getPlayerStyle();


        let flipChance =
            ai.baseFlipChance;


        // ==========================================
        // STRUGGLING PLAYER
        // ==========================================

        if (
            playerStyle ===
            "struggling"
        ) {

            // Give more opportunities
            // for safe interactions.

            flipChance +=
                0.15;

        }


        // ==========================================
        // AGGRESSIVE PLAYER
        // ==========================================

        if (
            playerStyle ===
            "aggressive"
        ) {

            // More unpredictable enemies.

            flipChance -=
                0.08;

        }


        // ==========================================
        // HIGH PERFORMANCE
        // ==========================================

        if (
            GameState.score >= 100 &&
            GameState.difficulty > 1.2
        ) {

            flipChance -=
                0.05;

        }


        flipChance =
            Math.max(
                0.08,
                Math.min(
                    0.65,
                    flipChance
                )
            );


        // ==========================================
        // UPDATE ENEMIES
        // ==========================================

        GameState.enemies.forEach(
            (enemy, index) => {

                if (
                    !this.enemyStateTimers.has(index)
                ) {

                    this.enemyStateTimers.set(
                        index,
                        {
                            timer: 0,
                            state:
                                enemy.state
                        }
                    );

                }


                const meta =
                    this.enemyStateTimers.get(index);


                meta.timer++;


                if (
                    meta.timer <
                    ai.minStateDuration
                ) {

                    return;

                }


                if (
                    Math.random() <
                    flipChance
                ) {

                    enemy.state =
                        enemy.state ===
                        "harmful"
                            ? "safe"
                            : "harmful";


                    meta.state =
                        enemy.state;


                    meta.timer = 0;

                }

            }
        );


        // ==========================================
        // AI COACH MESSAGE
        // ==========================================

        this.updateAdaptiveHint(
            playerStyle,
            performance
        );

    },


    // ==========================================
    // ADAPTIVE COACH
    // ==========================================

    updateAdaptiveHint(
        style,
        performance
    ) {

        if (
            !GameState.running
        ) {

            return;

        }


        if (
            style === "struggling"
        ) {

            this.setHint(
                "The AI sees you struggling. Green hunters are safe."
            );

            GameState.coach.timer =
                180;

            return;

        }


        if (
            style === "aggressive"
        ) {

            this.setHint(
                "You're moving fast. Watch where the hunters turn."
            );

            GameState.coach.timer =
                180;

            return;

        }


        if (
            style === "collector"
        ) {

            this.setHint(
                "The AI noticed your collection pattern."
            );

            GameState.coach.timer =
                180;

            return;

        }


        if (
            performance.preferredSide ===
            "left"
        ) {

            this.setHint(
                "You keep moving left. The AI is watching."
            );

            GameState.coach.timer =
                180;

            return;

        }


        if (
            performance.preferredSide ===
            "right"
        ) {

            this.setHint(
                "You keep moving right. The AI is watching."
            );

            GameState.coach.timer =
                180;

        }

    },


    // ==========================================
    // ORIGINAL COACH SYSTEM
    // ==========================================

    updateCoachHint(event) {

        const {
            player,
            collectibles,
            width
        } = GameState;


        if (
            event === "harder"
        ) {

            this.setHint(
                "Difficulty increased. Some hunters may turn green."
            );

            GameState.coach.timer =
                240;

            return;

        }


        if (
            !GameState.running
        ) {

            return;

        }


        const now =
            performance.now();


        // ------------------------------------------
        // No collection recently
        // ------------------------------------------

        if (
            player.recentCollectTimes.length >
            0
        ) {

            const last =
                player.recentCollectTimes[
                    player.recentCollectTimes.length - 1
                ];


            if (
                now - last >
                6000
            ) {

                this.setHint(
                    "You haven't collected in a while. Explore the map."
                );

                GameState.coach.timer =
                    180;

                return;

            }

        }


        // ------------------------------------------
        // Node distribution
        // ------------------------------------------

        const rightCount =
            collectibles.filter(
                c =>
                    c.x >
                    width / 2
            ).length;


        const leftCount =
            collectibles.length -
            rightCount;


        if (
            collectibles.length >= 4
        ) {

            if (
                rightCount >
                leftCount + 2
            ) {

                this.setHint(
                    "More data nodes are on the right."
                );

                GameState.coach.timer =
                    180;

                return;

            }


            if (
                leftCount >
                rightCount + 2
            ) {

                this.setHint(
                    "More data nodes are on the left."
                );

                GameState.coach.timer =
                    180;

                return;

            }

        }

    },


    // ==========================================
    // SET HINT
    // ==========================================

    setHint(text) {

        if (
            text ===
            GameState.coach.hint
        ) {

            return;

        }


        GameState.coach.hint =
            text;


        const coach =
            document.getElementById(
                "coach-text"
            );


        if (coach) {

            coach.textContent =
                text;

        }

    },


    // ==========================================
    // CENTER MESSAGE
    // ==========================================

    showCenterMessage(text) {

        const element =
            document.getElementById(
                "center-message"
            );


        if (!element) {
            return;
        }


        element.textContent =
            text;


        element.style.opacity =
            "1";


        element.style.transition =
            "none";


        setTimeout(
            () => {

                element.style.transition =
                    "opacity 1.2s ease";

                element.style.opacity =
                    "0";

            },
            1200
        );

    }

};