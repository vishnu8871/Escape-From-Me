const Renderer = {

    // ==========================================
    // BACKGROUND
    // ==========================================

    drawBackground(ctx) {

        const { width, height } = GameState;

        // Main background
        const gradient = ctx.createRadialGradient(
            width * 0.35,
            height * 0.35,
            50,
            width * 0.5,
            height * 0.5,
            Math.max(width, height)
        );

        gradient.addColorStop(0, "#0b1735");
        gradient.addColorStop(0.55, "#050b1d");
        gradient.addColorStop(1, "#02050d");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);


        // Grid
        ctx.strokeStyle = "rgba(96, 165, 250, 0.055)";
        ctx.lineWidth = 1;

        const gridSize = 50;

        for (let x = 0; x <= width; x += gridSize) {

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

        }

        for (let y = 0; y <= height; y += gridSize) {

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

        }


        // Subtle center glow
        const glow = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            Math.min(width, height) * 0.45
        );

        glow.addColorStop(
            0,
            "rgba(37, 99, 235, 0.07)"
        );

        glow.addColorStop(
            1,
            "rgba(37, 99, 235, 0)"
        );

        ctx.fillStyle = glow;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

    },


    // ==========================================
    // PLAYER
    // ==========================================

    drawPlayer(ctx) {

        const player = GameState.player;

        if (!player) return;


        // Outer glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#22c55e";

        ctx.fillStyle = "#22c55e";

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;


        // Inner core
        ctx.fillStyle = "#86efac";

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.size * 0.55,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // AI label
        ctx.fillStyle = "#052e16";

        ctx.font = "bold 10px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "AI",
            player.x,
            player.y
        );


        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

    },


    // ==========================================
    // COLLECTIBLES
    // ==========================================

    drawCollectibles(ctx) {

        const { collectibles } = GameState;

        if (!collectibles) return;


        collectibles.forEach(c => {

            c.pulse += 0.06;
            c.colorCycle += 0.02;


            const pulseScale =
                1 +
                0.18 *
                Math.sin(c.pulse);


            const hue =
                (
                    CONFIG.colors.collectibleBaseHue +
                    c.colorCycle * 30
                ) % 360;


            const color =
                `hsl(${hue}, 90%, 60%)`;


            // Outer glow
            ctx.shadowBlur = 22;
            ctx.shadowColor = "#38bdf8";

            ctx.fillStyle = color;

            ctx.beginPath();

            ctx.arc(
                c.x,
                c.y,
                c.size * pulseScale,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;


            // Inner highlight
            ctx.fillStyle =
                "rgba(255,255,255,0.75)";

            ctx.beginPath();

            ctx.arc(
                c.x - c.size * 0.3,
                c.y - c.size * 0.3,
                c.size * 0.25,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

    },


    // ==========================================
    // ENEMIES
    // ==========================================

    drawEnemies(ctx) {

        const { enemies } = GameState;

        if (!enemies) return;


        enemies.forEach(enemy => {

            const safe =
                enemy.state === "safe";


            const color =
                safe
                    ? CONFIG.colors.enemySafe
                    : CONFIG.colors.enemyHarmful;


            // Enemy glow
            ctx.shadowBlur = 20;

            ctx.shadowColor =
                safe
                    ? "#22c55e"
                    : "#ef4444";


            ctx.fillStyle = color;

            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;


            // Inner core
            ctx.fillStyle =
                "rgba(255,255,255,0.75)";

            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.size * 0.42,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Enemy type indicator
            ctx.fillStyle =
                safe
                    ? "#052e16"
                    : "#450a0a";

            ctx.font =
                "bold 9px Arial";

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";


            let label = "H";

            if (enemy.type === "predictor") {
                label = "P";
            }

            if (enemy.type === "cutter") {
                label = "C";
            }


            ctx.fillText(
                safe ? "SAFE" : label,
                enemy.x,
                enemy.y
            );


            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";

        });

    }

};