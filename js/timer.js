const Timer = {

    start() {

        GameState.startTime = performance.now();

        GameState.timeRemaining =
            GameState.timeLimit;

        GameState.timerWarningShown = false;

        this.updateDisplay();

    },


    update() {

        if (
            GameState.screen !== "playing" ||
            !GameState.startTime
        ) {
            return;
        }

        const elapsed =
            (performance.now() - GameState.startTime) / 1000;

        GameState.timeRemaining =
            Math.max(
                0,
                GameState.timeLimit - elapsed
            );

        this.updateDisplay();


        // =============================
        // 10 SECOND WARNING
        // =============================

        if (
            GameState.timeRemaining <= 10 &&
            !GameState.timerWarningShown
        ) {

            GameState.timerWarningShown = true;

            AI.showCenterMessage(
                "⚠ 10 SECONDS REMAINING"
            );

            const timer =
                document.getElementById("timer-panel");

            if (timer) {
                timer.classList.add("timer-warning");
            }
        }


        // =============================
        // TIME UP
        // =============================

        if (GameState.timeRemaining <= 0) {

            GameState.timeRemaining = 0;

            this.updateDisplay();

            Game.endGame("TIME COMPLETED");

        }

    },


    updateDisplay() {

        const timerElement =
            document.getElementById("timer-value");

        if (!timerElement) {
            return;
        }

        const seconds =
            Math.ceil(GameState.timeRemaining);

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        timerElement.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0");

    },


    reset() {

        GameState.timeRemaining =
            GameState.timeLimit;

        GameState.startTime = null;

        GameState.timerWarningShown = false;

        const timer =
            document.getElementById("timer-panel");

        if (timer) {
            timer.classList.remove("timer-warning");
        }

        this.updateDisplay();

    }

};