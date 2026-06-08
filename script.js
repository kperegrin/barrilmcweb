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

    // ---------------- Catálogo de cartas (desde cards.json en jsdelivr) ----------------
    const catalogGrid = document.getElementById('catalog-grid');
    const catalogCount = document.getElementById('catalog-count');
    const catalogFilters = document.getElementById('catalog-filters');

    const RARITY_META = {
        comun:       { name: 'Común',       color: '#9aa3b8' },
        poco_comun:  { name: 'Poco común',  color: '#45d483' },
        rara:        { name: 'Rara',        color: '#4ea6ff' },
        mitica:      { name: 'Mítica',      color: '#b66cff' },
        leyenda:     { name: 'Leyenda',     color: '#ffaa22' },
    };
    const RARITY_ORDER = ['leyenda', 'mitica', 'rara', 'poco_comun', 'comun'];

    let allCards = [];
    let currentFilter = 'all';

    function renderCatalog() {
        if (!catalogGrid) return;
        const filtered = currentFilter === 'all'
            ? allCards
            : allCards.filter(c => c.rarity === currentFilter);
        catalogGrid.innerHTML = '';
        for (const c of filtered) {
            const meta = RARITY_META[c.rarity] || { name: c.rarity, color: '#9aa3b8' };
            const div = document.createElement('div');
            div.className = 'catalog-card';
            div.style.setProperty('--c', meta.color);
            div.title = `${c.name} · ${meta.name}`;
            div.innerHTML = `
                <div class="catalog-card-img" style="background-image:url('${c.url}')"></div>
                <div class="catalog-card-foot">
                    <div class="catalog-card-name">${escapeHtml(c.name)}</div>
                    <span class="catalog-card-rarity">${meta.name}</span>
                </div>`;
            catalogGrid.appendChild(div);
        }
        if (catalogCount) {
            catalogCount.textContent = `Mostrando ${filtered.length} de ${allCards.length} cartas`;
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    if (catalogGrid) {
        // jsdelivr es el mismo CDN que usa el launcher: invalidación instantánea de commits.
        fetch('https://cdn.jsdelivr.net/gh/kperegrin/mi-servidor-launcher@main/launcher/cards.json')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data || !data.cards) {
                    catalogGrid.innerHTML = '<div class="catalog-loading">No se pudo cargar el catálogo.</div>';
                    return;
                }
                // Convertimos el objeto a array y ordenamos por rareza desc + nombre.
                allCards = Object.values(data.cards).sort((a, b) => {
                    const ra = RARITY_ORDER.indexOf(a.rarity);
                    const rb = RARITY_ORDER.indexOf(b.rarity);
                    if (ra !== rb) return ra - rb;
                    return (a.name || '').localeCompare(b.name || '');
                });
                renderCatalog();
            })
            .catch(() => {
                catalogGrid.innerHTML = '<div class="catalog-loading">Error de red al cargar el catálogo.</div>';
            });
    }

    if (catalogFilters) {
        catalogFilters.addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            catalogFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.rarity || 'all';
            renderCatalog();
        });
    }

    // ---------------- Posts de la comunidad de Barril ----------------
    // YouTube no tiene API pública gratuita para posts. Usamos un proxy CORS para
    // obtener la página /posts y parsear el ytInitialData embebido. Si el formato
    // de YouTube cambia o el proxy cae, mostramos un fallback con link al canal.
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        loadCommunityPosts();
    }

    function loadCommunityPosts() {
        const PROXY = 'https://corsproxy.io/?url=';
        const URL_ENC = encodeURIComponent('https://www.youtube.com/@barrilmc/posts');

        fetch(PROXY + URL_ENC, { headers: { 'Accept': 'text/html' } })
            .then(r => r.ok ? r.text() : Promise.reject('proxy'))
            .then(html => {
                const posts = extractPosts(html);
                if (posts.length === 0) throw new Error('no posts');
                renderPosts(posts.slice(0, 6));
            })
            .catch(() => {
                // Fallback estático
                postsGrid.innerHTML = `
                    <div class="posts-loading" style="line-height:1.7">
                        No se pudieron cargar las publicaciones automáticamente.<br>
                        <a href="https://www.youtube.com/@barrilmc/posts" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">
                            Verlas en YouTube →
                        </a>
                    </div>`;
            });
    }

    function extractPosts(html) {
        const results = [];
        const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
        if (!m) return results;
        let data;
        try { data = JSON.parse(m[1]); } catch { return results; }

        // Caminamos el árbol buscando 'backstagePostThreadRenderer'
        const stack = [data];
        while (stack.length && results.length < 12) {
            const node = stack.pop();
            if (!node || typeof node !== 'object') continue;
            if (node.backstagePostThreadRenderer) {
                const post = extractPostInfo(node.backstagePostThreadRenderer);
                if (post) results.push(post);
                continue;
            }
            for (const key of Object.keys(node)) {
                const v = node[key];
                if (v && typeof v === 'object') stack.push(v);
            }
        }
        return results;
    }

    function extractPostInfo(thread) {
        const r = thread.post && thread.post.backstagePostRenderer;
        if (!r) return null;
        let text = '';
        if (r.contentText && r.contentText.runs) {
            text = r.contentText.runs.map(x => x.text || '').join('');
        }
        let img = null;
        if (r.backstageAttachment) {
            const att = r.backstageAttachment;
            const imgs = att.backstageImageRenderer?.image?.thumbnails
                       || att.postMultiImageRenderer?.images?.[0]?.backstageImageRenderer?.image?.thumbnails
                       || att.videoRenderer?.thumbnail?.thumbnails;
            if (imgs && imgs.length) img = imgs[imgs.length - 1].url;
        }
        let when = '';
        if (r.publishedTimeText && r.publishedTimeText.runs) {
            when = r.publishedTimeText.runs.map(x => x.text || '').join('');
        }
        return { text: text.trim(), img, when };
    }

    function renderPosts(posts) {
        postsGrid.innerHTML = '';
        for (const p of posts) {
            const card = document.createElement('a');
            card.className = 'post-card';
            card.href = 'https://www.youtube.com/@barrilmc/posts';
            card.target = '_blank';
            card.rel = 'noopener';
            const imgHtml = p.img
                ? `<div class="post-img" style="background-image:url('${p.img}')"></div>`
                : '';
            card.innerHTML = `
                ${imgHtml}
                <div class="post-body">
                    <p class="post-text">${escapeHtml(p.text) || '(sin texto)'}</p>
                    <div class="post-meta">${escapeHtml(p.when)}</div>
                </div>`;
            postsGrid.appendChild(card);
        }
    }
})();
