const GameState = {

    canvas: null,
    ctx: null,

    width: 0,
    height: 0,


    // =============================
    // GAME FLOW
    // =============================

    screen: "welcome",

    running: false,


    // =============================
    // PLAYER
    // =============================

    playerName: "",

    player: null,


    // =============================
    // GAME DATA
    // =============================
    bestScore: 0,
    
    score: 0,

    frames: 0,

    difficulty: 1,


    // =============================
    // TIMER
    // =============================

    timeLimit: 60,

    timeRemaining: 60,

    startTime: null,

    timerWarningShown: false,


    // =============================
    // ENTITIES
    // =============================

    enemies: [],

    collectibles: [],

    particles: [],


    // =============================
    // AI COACH
    // =============================

    coach: {

        hint:
            "Collect blue nodes. Avoid red hunters.",

        timer: 0

    },


    // =============================
    // RESULT
    // =============================

    completionStatus: "",


    // =============================
    // VISUAL
    // =============================

    lastCenterMessage: ""

};