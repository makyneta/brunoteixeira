/* -------------------------------------------------
   particles.js – motor de partículas minimalista
   (exclusão completa das bordas direita e inferior)
   Licença: MIT
------------------------------------------------- */

(() => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;                     // segurança caso o canvas não exista

    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1; // suporte a telas retina

    /* -------------------- CONFIGURAÇÕES -------------------- */
    const config = {
        particleCount:      30,               // poucas partículas → visual clean
        maxVelocity:        0.3,              // movimento suave
        connectionDistance: 80,               // linhas só entre partículas próximas
        particleSize: {
            min: 1,
            max: 2
        },
        colors: {
            particle: '#a8e6a8', // verde claro (partículas)
            line:     '#0b3d0b'  // verde escuro (linhas)
        }
    };

    /* ----------- ÁREAS EXCLUÍDAS (direita + inferior) ----------- */
    // Percentual da largura que será removido à direita (0‑1)
    const EXCLUDE_RIGHT_RATIO  = 0.30;   // 30 % da largura à direita
    // Percentual da altura que será removido na parte inferior (0‑1)
    const EXCLUDE_BOTTOM_RATIO = 0.30;   // 30 % da altura embaixo

    /**
     * Verifica se a coordenada (x,y) está **fora** das áreas excluídas.
     * @returns true → pode ser desenhada; false → deve ser ignorada.
     */
    function isInsideDrawableArea(x, y, w, h) {
        const rightLimit  = w * (1 - EXCLUDE_RIGHT_RATIO);   // limite esquerdo da faixa direita
        const bottomLimit = h * (1 - EXCLUDE_BOTTOM_RATIO);  // limite superior da faixa inferior

        // Se x ultrapassa o limite direito OU y ultrapassa o limite inferior → fora da zona drawable
        if (x > rightLimit) return false;
        if (y > bottomLimit) return false;
        return true;
    }

    /**
     * Verifica se o ponto médio de uma linha está dentro da zona drawable.
     * Se o meio cair na faixa excluída, descartamos a linha inteira.
     */
    function isLineInsideDrawableArea(x1, y1, x2, y2, w, h) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return isInsideDrawableArea(mx, my, w, h);
    }

    /* -------------------- CLASSE PARTICLE -------------------- */
    class Particle {
        constructor(width, height) {
            this.x  = Math.random() * width;
            this.y  = Math.random() * height;
            this.vx = (Math.random() - 0.5) * config.maxVelocity;
            this.vy = (Math.random() - 0.5) * config.maxVelocity;
            this.size = config.particleSize.min +
                        Math.random() *
                        (config.particleSize.max - config.particleSize.min);
        }

        move(width, height) {
            this.x += this.vx;
            this.y += this.vy;

            // rebote nas bordas
            if (this.x <= 0 || this.x >= width)  this.vx *= -1;
            if (this.y <= 0 || this.y >= height) this.vy *= -1;
        }

        draw(context, canvasW, canvasH) {
            // Só desenha se estiver fora das áreas excluídas
            if (!isInsideDrawableArea(this.x, this.y, canvasW, canvasH)) return;
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fillStyle = config.colors.particle;
            context.fill();
        }
    }

    /* -------------------- VARIÁVEIS GLOBAIS -------------------- */
    const particles = [];

    /* -------------------- FUNÇÕES AUXILIARES -------------------- */

    // Redimensiona o canvas para ocupar toda a janela (considerando DPR)
    function resizeCanvas() {
        canvas.width  = window.innerWidth  * DPR;
        canvas.height = window.innerHeight * DPR;
        canvas.style.width  = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(DPR, DPR);
    }

    // Cria o array de partículas
    function initParticles() {
        particles.length = 0;
        const w = canvas.width  / DPR;
        const h = canvas.height / DPR;
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle(w, h));
        }
    }

    // Desenha linhas entre partículas próximas, mas só se a linha inteira
    // (pelo menos o ponto médio) estiver fora das áreas excluídas.
    function connectParticles(canvasW, canvasH) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {

                // Ambos os pontos precisam estar dentro da zona drawable
                if (
                    !isInsideDrawableArea(particles[i].x, particles[i].y, canvasW, canvasH) ||
                    !isInsideDrawableArea(particles[j].x, particles[j].y, canvasW, canvasH)
                ) continue;

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.connectionDistance) {
                    // Se o ponto médio da linha cair na faixa excluída, ignora a linha
                    if (!isLineInsideDrawableArea(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y,
                            canvasW, canvasH)) {
                        continue;
                    }

                    // Opacidade máxima ≈ 0.4 (para ficar sutil)
                    const opacity = Math.min(0.4, 1 - dist / config.connectionDistance);
                    const hexOpacity = Math.round(opacity * 255)
                                         .toString(16)
                                         .padStart(2, '0');

                    ctx.strokeStyle = `${config.colors.line}${hexOpacity}`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop de animação principal
    function animate() {
        const cw = canvas.width  / DPR;
        const ch = canvas.height / DPR;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // mover e desenhar partículas (já verifica a zona excluída dentro de draw())
        particles.forEach(p => {
            p.move(cw, ch);
            p.draw(ctx, cw, ch);
        });

        // conectar linhas (também respeita as áreas excluídas)
        connectParticles(cw, ch);

        requestAnimationFrame(animate);
    }

    /* -------------------- EVENTOS -------------------- */

    // Redimensiona o canvas sempre que a janela mudar de tamanho
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();   // recria partículas para evitar artefatos
    });

    // Inicialização ao carregar a página
    function start() {
        resizeCanvas();
        initParticles();
        animate();
    }

    // Garantimos que o script rode depois que o DOM estiver pronto
    if (document.readyState === 'complete' ||
        document.readyState === 'interactive') {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start);
    }

})();   // fim do IIFE