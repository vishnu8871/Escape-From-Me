const Particles = {

    // ==========================================
    // COLLECT NODE EFFECT
    // ==========================================

    createCollectParticles(x, y) {

        for (let i = 0; i < 18; i++) {

            GameState.particles.push({

                x: x,
                y: y,

                vx: randRange(-3, 3),
                vy: randRange(-3, 3),

                life: 25 + Math.random() * 10,

                size: randRange(2, 4),

                color: "#38bdf8"

            });

        }

    },


    // ==========================================
    // PLAYER DEATH EFFECT
    // ==========================================

    createDeathParticles(x, y) {

        for (let i = 0; i < 30; i++) {

            GameState.particles.push({

                x: x,
                y: y,

                vx: randRange(-5, 5),
                vy: randRange(-5, 5),

                life: 30 + Math.random() * 15,

                size: randRange(2.5, 5),

                color: "#ef4444"

            });

        }

    },


    // ==========================================
    // SAFE ENEMY HIT
    // ==========================================

    createSafeHitParticles(x, y) {

        for (let i = 0; i < 16; i++) {

            GameState.particles.push({

                x: x,
                y: y,

                vx: randRange(-3, 3),
                vy: randRange(-3, 3),

                life: 20 + Math.random() * 10,

                size: randRange(2, 4),

                color: "#22c55e"

            });

        }

    },


    // ==========================================
    // UPDATE + DRAW
    // ==========================================

    updateAndDraw(ctx) {

        const particles = GameState.particles;

        if (!particles) {
            return;
        }


        for (
            let i = particles.length - 1;
            i >= 0;
            i--
        ) {

            const p = particles[i];


            p.x += p.vx;
            p.y += p.vy;


            p.vx *= 0.96;
            p.vy *= 0.96;


            p.life--;


            const alpha =
                Math.max(0, p.life / 35);


            ctx.globalAlpha = alpha;

            ctx.fillStyle = p.color;

            ctx.shadowBlur = 10;

            ctx.shadowColor = p.color;


            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.globalAlpha = 1;

            ctx.shadowBlur = 0;


            if (p.life <= 0) {

                particles.splice(i, 1);

            }

        }

    }

};