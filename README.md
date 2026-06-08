# BarrilMC Launcher — Landing page

Web oficial del launcher de BarrilMC. HTML/CSS/JS vanilla, sin frameworks ni build step. Lista para desplegar en Vercel, Netlify o GitHub Pages.

## Estructura

```
barrilmc-web/
├── index.html      ← contenido completo
├── style.css       ← estilos (modo oscuro, paleta naranja del launcher)
├── script.js       ← partículas, nav, reveal-on-scroll, fetch de versión
├── vercel.json     ← config mínima de Vercel (cacheo de assets)
└── README.md
```

Cero dependencias externas. Carga en < 0.5 s.

## Deploy en Vercel (paso a paso)

### Opción A — vía web (más fácil)

1. Sube esta carpeta a un repo nuevo en GitHub. Por ejemplo: `kperegrin/barrilmc-web`.
2. Entra a [vercel.com](https://vercel.com) → login con GitHub.
3. **Add new** → **Project** → elige el repo `barrilmc-web`.
4. Framework Preset: deja **"Other"** (es estático puro).
5. **Deploy**.
6. En 30 s tienes la web en `barrilmc-web.vercel.app`.

Para usar un dominio propio (`barrilmc.com` p.ej.):
- En Vercel, ve a Settings → Domains → Add.
- Apunta los DNS de tu dominio a Vercel (te dice qué registros añadir).

### Opción B — desde la terminal

```bash
cd G:/launcher/barrilmc-web
npx vercel       # primera vez: te pide login
npx vercel --prod  # publica a producción
```

## Cómo personalizarlo

| Quieres cambiar… | Edita |
|---|---|
| Nombre del servidor / IP | `index.html` línea ~146 (`server-detail`) |
| Logo (el barrilito 🛢️) | `index.html` busca `logo-icon` y sustituye por `<img src="logo.png">` |
| Texto del creador | `index.html` sección `#creator` |
| Colores | `style.css` arriba del todo: `--accent`, `--accent-2` |
| Links de redes | Busca `youtube.com/@barrilmc` y `github.com/kperegrin` |
| Partículas (densidad) | `script.js` constante `COUNT` |

## Cosas que la web lee en vivo

- **Última versión del launcher**: se trae de la GitHub Releases API. Si subes un release nuevo, la web se actualiza sola al recargar.
- **Botón de descarga**: apunta a `releases/latest/download/BarrilMC-Launcher.exe` → siempre la última.
- **Contador de jugadores online**: por ahora es un placeholder animado (10-39 al azar). Si quieres conectarlo a tu server real, edita `script.js` en la sección "Server status".

## Notas

- Diseño responsive (móvil, tablet, escritorio).
- Modo oscuro forzado (queda mejor para una landing de servidor MC).
- Fuentes desde Google Fonts (Inter + JetBrains Mono).
- Animaciones suaves: partículas en hero, reveal-on-scroll, hover en cards.
