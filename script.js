/* =================================================================
   BarrilMC Launcher · landing scripts
   - Partículas animadas en el hero (canvas)
   - Nav móvil + sticky con borde al hacer scroll
   - Reveal de secciones al entrar en viewport
   - Contador de jugadores online (stub, conectable a la API real)
   - Versión última desde GitHub Releases API
   ================================================================= */

(() => {
    'use strict';

    // ---------------- Particles ----------------
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h, raf;
        const COUNT = window.innerWidth < 700 ? 32 : 72;
        const COLORS = ['rgba(255,170,34,0.55)', 'rgba(255,122,24,0.4)', 'rgba(255,255,255,0.25)'];

        const resize = () => {
            w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        };
        resize();
        window.addEventListener('resize', resize);

        const make = () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: (Math.random() * 1.8 + 0.5) * window.devicePixelRatio,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            phase: Math.random() * Math.PI * 2,
        });

        for (let i = 0; i < COUNT; i++) particles.push(make());

        const draw = (t) => {
            ctx.clearRect(0, 0, w, h);
            // líneas entre partículas cercanas
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    const max = 140 * window.devicePixelRatio;
                    if (dist < max) {
                        ctx.strokeStyle = `rgba(255,170,34,${(1 - dist / max) * 0.12})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            // partículas
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
                const pulse = (Math.sin(t / 1500 + p.phase) + 1) / 2;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * (0.7 + pulse * 0.6), 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        draw(0);

        // pausa al cambiar de tab para no chupar CPU
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(draw);
        });
    }

    // ---------------- Nav (sticky + móvil) ----------------
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    if (nav) {
        const onScroll = () => {
            nav.classList.toggle('scrolled', window.scrollY > 24);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            links.classList.toggle('open');
        });
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                toggle.classList.remove('open');
                links.classList.remove('open');
            });
        });
    }

    // ---------------- Reveal on scroll ----------------
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('shown');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(el => io.observe(el));
    } else {
        // fallback: muestra todo
        reveals.forEach(el => el.classList.add('shown'));
    }

    // ---------------- Server status (placeholder con datos animados) ----------------
    // Si tienes una API pública con el status del server, sustitúyela aquí.
    const playerCountEl = document.getElementById('player-count');
    if (playerCountEl) {
        // Animación de número subiendo desde 0
        const target = 10 + Math.floor(Math.random() * 30); // 10-39 jugadores
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const id = setInterval(() => {
            current = Math.min(target, current + step);
            playerCountEl.textContent = current;
            if (current >= target) clearInterval(id);
        }, 25);
    }

    // ---------------- Última versión desde GitHub Releases API ----------------
    const versionEl = document.getElementById('latest-version');
    if (versionEl) {
        fetch('https://api.github.com/repos/kperegrin/mi-servidor-launcher/releases/latest')
            .then(r => r.ok ? r.json() : null)
            .then(json => {
                if (!json) return;
                const tag = (json.tag_name || '').replace(/^v/, '');
                if (tag) versionEl.textContent = tag;
            })
            .catch(() => { /* mantiene el hardcoded del HTML */ });
    }
})();
