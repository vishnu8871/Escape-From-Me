const Game = {

    keys: {},


    // ==========================================
    // INITIALIZATION
    // ==========================================

    init() {

        const canvas =
            document.getElementById("game");

        const ctx =
            canvas.getContext("2d");

        GameState.canvas = canvas;
        GameState.ctx = ctx;


        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );


        // ==========================================
        // KEYBOARD
        // ==========================================

        document.addEventListener(
            "keydown",
            e => {

                this.keys[
                    e.key.toLowerCase()
                ] = true;

            }
        );


        document.addEventListener(
            "keyup",
            e => {

                this.keys[
                    e.key.toLowerCase()
                ] = false;

            }
        );


        // ==========================================
        // CONTINUE
        // ==========================================

        const continueBtn =
            document.getElementById("continue-btn");

        if (continueBtn) {

            continueBtn.addEventListener(
                "click",
                () => this.handleNameSubmit()
            );

        }

        const instructionsScreen =
            document.getElementById("instructions-screen");

        if (instructionsScreen) {
            instructionsScreen.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();

            this.startGame();

            }

        });
    }


        // ==========================================
        // ENTER KEY
        // ==========================================

        const nameInput =
            document.getElementById("player-name-input");

        if (nameInput) {

            nameInput.addEventListener(
                "keydown",
                e => {

                    if (e.key === "Enter") {

                        e.preventDefault();

                        this.handleNameSubmit();

                    }

                }
            );

        }


        // ==========================================
        // START
        // ==========================================

        const startBtn =
            document.getElementById("start-btn");

        if (startBtn) {

            startBtn.addEventListener(
                "click",
                () => this.startGame()
            );

        }


        // ==========================================
        // PLAY AGAIN
        // ==========================================

        const restartBtn =
            document.getElementById("restart-btn");

        if (restartBtn) {

            restartBtn.addEventListener(
                "click",
                () => this.returnToWelcome()
            );

        }


        // ==========================================
        // INITIAL STATE
        // ==========================================

        this.resetGameState();

        GameState.screen = "welcome";

        GameState.running = false;

        UI.showWelcome();


        // ==========================================
        // LOOP
        // ==========================================

        this.loop();

    },


    // ==========================================
    // RESIZE
    // ==========================================

    resize() {

        const canvas =
            GameState.canvas;

        if (!canvas) {
            return;
        }

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

        GameState.width =
            canvas.width;

        GameState.height =
            canvas.height;

    },


    // ==========================================
    // NAME VALIDATION
    // ==========================================

    handleNameSubmit() {

        const name =
            UI.getPlayerName();

        if (!name) {

            UI.showNameError(
                "Please enter your name."
            );

            return;

        }


        if (
            name.length >
            CONFIG.game.playerNameMaxLength
        ) {

            UI.showNameError(
                "Name must be 20 characters or less."
            );

            return;

        }


        GameState.playerName =
            name;


        GameState.screen =
            "instructions";

        GameState.running =
            false;


        UI.showInstructions();

    },


    // ==========================================
    // START GAME
    // ==========================================

    startGame() {

        this.resetGameState();


        GameState.screen =
            "playing";

        GameState.running =
            true;


        UI.showGame();


        Timer.start();


        AI.init();


        // ==========================================
        // INITIAL ENTITIES
        // ==========================================

        for (
            let i = 0;
            i < CONFIG.collectibles.initialCount;
            i++
        ) {

            Entities.spawnCollectible();

        }


        for (
            let i = 0;
            i < CONFIG.enemies.initialCount;
            i++
        ) {

            Entities.spawnEnemy();

        }

    },


    // ==========================================
    // RESET GAME STATE
    // ==========================================

    resetGameState() {

        GameState.score = 0;

        GameState.frames = 0;

        GameState.difficulty = 1;

        GameState.timeLimit =
            CONFIG.game.duration;

        GameState.timeRemaining =
            CONFIG.game.duration;

        GameState.startTime = null;

        GameState.timerWarningShown =
            false;

        GameState.completionStatus = "";

        GameState.enemies = [];

        GameState.collectibles = [];

        GameState.particles = [];

        GameState.coach.hint =
            "Collect blue nodes. Avoid red hunters.";

        GameState.coach.timer = 0;

        GameState.lastCenterMessage = "";


        const score =
            document.getElementById("score-value");

        if (score) {
            score.textContent = "0";
        }


        const coach =
            document.getElementById("coach-text");

        if (coach) {

            coach.textContent =
                GameState.coach.hint;

        }


        Timer.reset();


        // ==========================================
        // PLAYER
        // ==========================================

        Entities.initPlayer();

    },


    // ==========================================
    // END GAME
    // ==========================================

    endGame(reason = "TIME COMPLETED") {

        if (
            GameState.screen !== "playing"
        ) {
            return;
        }


        GameState.running = false;

        GameState.screen = "result";

        GameState.completionStatus = reason;

        // ==========================================
        // PERSONAL BEST SCORE
        // ==========================================

        const currentScore = GameState.score;

        const savedBest =
        parseInt(
            localStorage.getItem("aiDataRushBestScore") || "0",
            10
        );

        const bestScore =
        Math.max(currentScore, savedBest);


        // Save highest score
        localStorage.setItem(
            "aiDataRushBestScore",
            bestScore
        );


        // Store for result screen
        GameState.bestScore = bestScore;


        Timer.reset();


        UI.showResult();

    },


    // ==========================================
    // RETURN TO WELCOME
    // ==========================================

    returnToWelcome() {

        GameState.running = false;

        GameState.screen = "welcome";

        GameState.playerName = "";

        this.keys = {};

        this.resetGameState();

        UI.showWelcome();

    },


    // ==========================================
    // MAIN LOOP
    // ==========================================

    loop() {

        const ctx =
            GameState.ctx;

        const {
            width,
            height
        } = GameState;


        if (
            !ctx ||
            !width ||
            !height
        ) {

            requestAnimationFrame(
                () => this.loop()
            );

            return;

        }


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        Renderer.drawBackground(ctx);


        // ==========================================
        // GAMEPLAY
        // ==========================================

        if (
            GameState.screen === "playing" &&
            GameState.running
        ) {

            Timer.update();


            if (
                GameState.screen === "playing"
            ) {

                Entities.updatePlayer(
                    this.keys
                );

                Entities.updateEnemies();

                Entities.checkCollectibles();


                // ==========================================
                // AI DECISION
                // ==========================================

                if (
                    GameState.frames %
                    CONFIG.ai.decisionInterval ===
                    0
                ) {

                    AI.updateEnemyStates();

                }


                // ==========================================
                // COACH
                // ==========================================

                if (
                    GameState.frames % 60 === 0
                ) {

                    if (
                        GameState.coach.timer > 0
                    ) {

                        GameState.coach.timer--;

                    } else {

                        AI.updateCoachHint(
                            "periodic"
                        );

                    }

                }

            }

        }


        // ==========================================
        // RENDER
        // ==========================================

        Renderer.drawCollectibles(ctx);

        Renderer.drawEnemies(ctx);

        if (GameState.player) {

            Renderer.drawPlayer(ctx);

        }

        Particles.updateAndDraw(ctx);


        GameState.frames++;


        requestAnimationFrame(
            () => this.loop()
        );

    }

};


// ==========================================
// RANDOM NUMBER
// ==========================================

function randRange(min, max) {

    return min +
        Math.random() *
        (max - min);

}


// ==========================================
// START
// ==========================================

window.addEventListener(
    "load",
    () => {

        try {

            Game.init();

        } catch (error) {

            console.error(
                "Game initialization error:",
                error
            );

        }

    }
);