const CONFIG = {

    // =============================
    // GAME
    // =============================

    game: {

        duration: 60,

        warningTime: 10,

        playerNameMaxLength: 20

    },


    // =============================
    // PLAYER
    // =============================

    player: {

        baseSpeed: 6,

        size: 20,

        acceleration: 0.8,

        friction: 0.92

    },


    // =============================
    // ENEMIES
    // =============================

    enemies: {

        initialCount: 3,

        baseSpeedMin: 2.2,

        baseSpeedMax: 3.2,

        size: 18

    },


    // =============================
    // COLLECTIBLES
    // =============================

    collectibles: {

        initialCount: 5,

        size: 12,

        scorePerPick: 10

    },


    // =============================
    // AI
    // =============================

    ai: {

        decisionInterval: 90,

        baseFlipChance: 0.25,

        aggressiveAdjust: 0.2,

        minStateDuration: 120

    },


    // =============================
    // COLORS
    // =============================

    colors: {

        enemyHarmful: "#ef4444",

        enemySafe: "#22c55e",

        player: "#22c55e",

        collectibleBaseHue: 190

    }

};