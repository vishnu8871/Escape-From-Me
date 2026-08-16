const UI = {

    showWelcome() {

        document
            .getElementById("welcome-screen")
            .classList.remove("hidden");

        document
            .getElementById("instructions-screen")
            .classList.add("hidden");

        document
            .getElementById("result-screen")
            .classList.add("hidden");

        document
            .getElementById("ui-layer")
            .classList.add("hidden");

        const input =
            document.getElementById("player-name-input");

        if (input) {

            input.value = "";

            setTimeout(() => {
                input.focus();
            }, 100);

        }

        const error =
            document.getElementById("name-error");

        if (error) {
            error.textContent = "";
        }

    },


    showInstructions() {

        document
            .getElementById("welcome-screen")
            .classList.add("hidden");

        document
            .getElementById("instructions-screen")
            .classList.remove("hidden");

    },


    showGame() {

        document
            .getElementById("welcome-screen")
            .classList.add("hidden");

        document
            .getElementById("instructions-screen")
            .classList.add("hidden");

        document
            .getElementById("result-screen")
            .classList.add("hidden");

        document
            .getElementById("ui-layer")
            .classList.remove("hidden");

    },


    showResult() {

        document
            .getElementById("ui-layer")
            .classList.add("hidden");

        document
            .getElementById("result-screen")
            .classList.remove("hidden");


        document
            .getElementById("result-player-name")
            .textContent =
            GameState.playerName;


        document
            .getElementById("final-score")
            .textContent =
            GameState.score;

        // ==========================================
        // DISPLAY HIGHEST SCORE
        // ==========================================

        document
            .getElementById("best-score")
            .textContent =
            GameState.bestScore;


        document
            .getElementById("completion-status")
            .textContent =
            GameState.completionStatus;

    },


    showNameError(message) {

        const error =
            document.getElementById("name-error");

        if (error) {
            error.textContent = message;
        }

    },


    getPlayerName() {

        const input =
            document.getElementById("player-name-input");

        if (!input) {
            return "";
        }

        return input.value.trim();

    }

};