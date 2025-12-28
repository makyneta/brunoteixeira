/* -------------------------------------------------
   main.js – controla:
   • Partículas (configuração)
   • Lightbox da galeria
   • Scroll‑triggered animações (IntersectionObserver)
--------------------------------------------------- */

/* ==== Partículas (efeito de átomos) ==== */
particlesJS('particles-js', {
    "fps_limit": 60,
    "particles": {
        "number": { "value": 70 },
        "color": { "value": "#a8e6a8" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.6, "random": true },
        "size": { "value": 3, "random": true },
        "move": {
            "enable": true,
            "speed": 1.2,
            "direction": "none",
            "out_mode": "bounce"
        },
        "line_linked": {
            "enable": true,
            "distance": 110,
            "color": "#0b3d0b",
            "opacity": 0.3,
            "width": 1
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": { "enable": true, "mode": "grab" },
            "onclick": { "enable": true, "mode": "push" }
        },
        "modes": {
            "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } },
            "push": { "particles_nb": 4 }
        }
    },
    "retina_detect": true
});

/* ==== Lightbox para a galeria ==== */
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox';
        overlay.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    });
});

/* ==== Animações ao entrar na viewport (IntersectionObserver) ==== */
const observerOptions = {
    threshold: 0.15
};

const fadeUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view'); // opcional, caso queira mais estilos
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicar a todos os blocos que queremos animar ao rolar
document.querySelectorAll('.icon-item').forEach(el => fadeUpObserver.observe(el));