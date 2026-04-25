# Prode Mundial 2026

Aplicación web de pronósticos para el FIFA World Cup 2026. Los usuarios predicen resultados de partidos, acumulan puntos y compiten en un ranking grupal.

**URL de producción**: https://prode-mundial-cpdo.vercel.app

---

## Tecnologías

| Capa                  | Tecnología                     |
| --------------------- | ------------------------------ |
| Frontend              | React + Vite                   |
| Autenticación         | Auth0 (Google OAuth)           |
| Base de datos         | MongoDB Atlas M0               |
| Backend               | Vercel Serverless Functions    |
| API de resultados     | football-data.org (free tier)  |
| Deploy                | Vercel (Hobby plan)            |
| Banderas              | flagcdn.com                    |

---

## Funcionalidades

- **Autenticación** con Google via Auth0
- **Sistema de grupos** — cada grupo tiene su propio ranking aislado con código de invitación
- **Predicciones de grupos** — predecís el marcador de cada partido (grupos A–L) hasta que empieza
- **Predicciones eliminatorias** — una vez que se conocen los cruces, podés predecirlos desde Mi prode → Eliminatorias
- **Bloqueo automático** — las predicciones se bloquean cuando arranca el partido (verificado en backend)
- **Ranking grupal** — ordenado por puntos, con desempate por exactos y ganadores acertados
- **Fixture** — tabla con fecha/hora de cada partido, marcador en vivo y resultado final
- **Posiciones** — tabla de cada grupo con todos los equipos (muestra 0-0-0 antes de que empiecen)
- **Bracket eliminatorio** — visualización en árbol de la fase eliminatoria, responsive con scale automático
- **Panel de administración** — gestión de partidos, usuarios y grupos
- **Responsive** — funciona en mobile y desktop

---

## Arquitectura

```
Browser (React SPA)
       │
       ├── Auth0 (autenticación Google)
       │      └── /userinfo → verifica JWT en cada escritura
       │
       ├── Vercel Serverless Functions (API)
       │         │
       │         ├── MongoDB Atlas (datos)
       │         └── football-data.org (resultados externos)
       │
       └── flagcdn.com (imágenes de banderas)
```

No hay servidor persistente — cada request levanta una función serverless. La conexión a MongoDB se reutiliza entre invocaciones (conexión cacheada en `_db.js`).

**Seguridad**: cada endpoint de escritura verifica el Bearer token de Auth0 contra `/userinfo` antes de operar. Los endpoints de admin requieren el header `x-admin-id` con el `ADMIN_USER_ID` configurado.

---

## Instalación

```bash
git clone https://github.com/NicoAgnello/prode-mundial
cd prode-mundial
npm install
```

Para desarrollo con API routes:

```bash
npm i -g vercel
vercel dev
```

> Con `npm run dev` (solo Vite) las rutas `/api/*` no funcionan. Usar `vercel dev` para desarrollo completo.

---

## Variables de entorno

### Frontend (prefijo `VITE_`)

```env
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
VITE_ADMIN_EMAIL=email_del_admin
```

### Backend (solo servidor)

```env
AUTH0_DOMAIN=tu-dominio.us.auth0.com
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/prode-mundial
FOOTBALL_DATA_API_KEY=tu_api_key_de_football_data_org
ADMIN_USER_ID=google-oauth2|id_del_admin
CRON_SECRET=string_secreto_para_cron_externo
```

| Variable                  | Dónde obtenerla                                          |
| ------------------------- | -------------------------------------------------------- |
| `VITE_AUTH0_DOMAIN`       | Auth0 → Applications → Settings → Domain                |
| `VITE_AUTH0_CLIENT_ID`    | Auth0 → Applications → Settings → Client ID             |
| `AUTH0_DOMAIN`            | Mismo valor que `VITE_AUTH0_DOMAIN`                      |
| `MONGODB_URI`             | Atlas → Connect → Drivers → Connection String            |
| `FOOTBALL_DATA_API_KEY`   | football-data.org → cuenta gratuita → API token         |
| `ADMIN_USER_ID`           | Auth0 → User Management → Users → user_id del admin     |
| `CRON_SECRET`             | Cualquier string largo aleatorio (`openssl rand -hex 32`)|

---

## Endpoints de la API

### Públicos

| Método | Endpoint                       | Descripción                            |
| ------ | ------------------------------ | -------------------------------------- |
| GET    | `/api/partidos`                | Listar todos los partidos              |
| GET    | `/api/posiciones`              | Tabla de posiciones por grupo          |
| GET    | `/api/predicciones?userId=xxx` | Predicciones de un usuario             |
| POST   | `/api/predicciones`            | Crear/actualizar predicción (Bearer token requerido) |
| GET    | `/api/ranking?userId=xxx`      | Ranking filtrado por grupo del usuario |
| POST   | `/api/usuarios`                | Registrar/actualizar usuario (Bearer token requerido) |
| GET    | `/api/grupos?userId=xxx`       | Info del grupo del usuario             |
| POST   | `/api/grupos`                  | Unirse a un grupo (Bearer token requerido) |

### Admin (requieren header `x-admin-id: ADMIN_USER_ID`)

| Método    | Endpoint                                        | Descripción                                        |
| --------- | ----------------------------------------------- | -------------------------------------------------- |
| POST      | `/api/admin/cargar-mundial`                     | Carga los 72 partidos de la fase de grupos         |
| GET/POST  | `/api/admin/sincronizar`                        | Sincroniza resultados con football-data.org y calcula puntos |
| GET       | `/api/admin/usuarios`                           | Lista todos los usuarios con stats                 |
| GET       | `/api/admin/predicciones-partido?partidoId=xxx` | Predicciones de un partido específico              |
| POST      | `/api/admin/acciones`                           | Acciones varias (ver body)                         |

#### Acciones disponibles en `/api/admin/acciones`

```json
{ "action": "recalcular" }
{ "action": "limpiar-partidos" }
{ "action": "limpiar-predicciones", "targetUserId": "opcional" }
{ "action": "resetear-puntos" }
{ "action": "crear-grupo", "nombre": "Leibnitz 2026", "codigo": "LEIBNITZ2026" }
{ "action": "listar-grupos" }
{ "action": "resetear-grupo", "targetUserId": "google-oauth2|xxx" }
```

---

## Sistema de puntaje

| Resultado                                       | Puntos    |
| ----------------------------------------------- | --------- |
| Marcador exacto (ej: predijiste 2-1, salió 2-1) | **3 pts** |
| Acertaste ganador o empate pero no el marcador  | **1 pt**  |
| Error total                                     | **0 pts** |

Desempate en ranking: puntos totales → exactos → ganadores acertados.

---

## Sistema de grupos

1. El admin crea un grupo con nombre y código desde el Panel Admin
2. Comparte el código con los participantes (ej: `LEIBNITZ2026`)
3. Al entrar por primera vez, el usuario ingresa el código y ve un preview antes de confirmar
4. Una vez unido, el ranking del grupo queda separado del resto
5. Si un usuario se equivoca de grupo, el admin puede resetearlo desde la sección Usuarios

---

## Sincronización de resultados

El endpoint `/api/admin/sincronizar` hace lo siguiente:

1. Busca partidos `NS` cuya fecha ya pasó → los pasa a `1H` (bloquea predicciones)
2. Consulta football-data.org por partidos `FINISHED` del Mundial (`WC`)
3. Para cada partido terminado no registrado: guarda goles y calcula puntos de todas las predicciones
4. Fuera del período del Mundial (8 jun – 21 jul 2026) devuelve `omitido: true`

Se puede llamar manualmente desde el Panel Admin o via cron externo con `Authorization: Bearer CRON_SECRET`.

---

## Panel de administración

Accesible en `/admin` solo para el email configurado como `VITE_ADMIN_EMAIL`.

**Flujo normal del Mundial:**
1. **Cargar Mundial 2026** → carga los 72 partidos de grupos (hacer una vez antes del torneo)
2. **Sincronizar resultados** → trae resultados y calcula puntos
3. Para la fase eliminatoria: cargar los cruces manualmente a medida que se conocen

**Secciones:**
- **Usuarios** — ver stats, borrar predicciones, resetear grupo
- **Partidos** — ver estado de partidos, ver predicciones por partido
- **Grupos** — crear grupos, ver miembros
- **Utilidades** — recalcular puntos, resetear, limpiar datos

---

## Estructura del proyecto

```
prode-mundial/
├── api/                              # Vercel Serverless Functions (backend)
│   ├── _auth.js                      # Verifica Bearer token via Auth0 /userinfo
│   ├── _db.js                        # Conexión cacheada a MongoDB
│   ├── partidos.js                   # GET todos los partidos
│   ├── posiciones.js                 # GET tabla de posiciones por grupo
│   ├── predicciones.js               # GET/POST predicciones (JWT verificado)
│   ├── ranking.js                    # GET ranking del grupo del usuario
│   ├── usuarios.js                   # POST registrar/actualizar usuario (JWT verificado)
│   ├── grupos.js                     # GET info grupo / POST unirse (JWT verificado)
│   └── admin/
│       ├── acciones.js               # POST acciones múltiples de administración
│       ├── cargar-mundial.js         # POST cargar partidos del Mundial
│       ├── sincronizar.js            # GET/POST sync con football-data.org + calcular puntos
│       ├── usuarios.js               # GET lista usuarios con stats
│       └── predicciones-partido.js   # GET predicciones de un partido
├── src/
│   ├── components/layout/
│   │   ├── Layout.jsx                # Navbar + footer (responsive, hamburger en mobile)
│   │   └── Cargando.jsx              # Pantalla de carga
│   ├── hooks/
│   │   ├── useProde.js               # usePartidos, usePosiciones, useRanking, useMisPredicciones
│   │   └── useRegistrarUsuario.js    # Registro automático al loguearse
│   ├── pages/
│   │   ├── Home.jsx                  # Landing con stats y explicación
│   │   ├── Fixture.jsx               # 3 tabs: Fixture / Posiciones / Bracket eliminatorio
│   │   ├── Ranking.jsx               # Tabla de posiciones del grupo
│   │   ├── MiProde.jsx               # Predicciones: tab Grupos (A-L) + tab Eliminatorias
│   │   ├── Admin.jsx                 # Panel de administración
│   │   └── UnirseGrupo.jsx           # Pantalla de código de invitación
│   ├── styles/global.css             # Variables CSS + estilos base + skeleton
│   ├── App.jsx                       # Rutas + lógica de grupo obligatorio
│   └── main.jsx
├── .env                              # Variables locales (no commitear)
├── vercel.json
├── vite.config.js
└── package.json
```

> **Límite Vercel Hobby**: máximo 12 Serverless Functions. Este proyecto usa **11** (archivos con prefijo `_` no cuentan como función).

---

## Colecciones de MongoDB

### `partidos`

```json
{
  "local": "Argentina",
  "visitante": "Argelia",
  "banderaLocal": "https://flagcdn.com/w80/ar.png",
  "banderaVisitante": "https://flagcdn.com/w80/dz.png",
  "fecha": "2026-06-17T02:00:00Z",
  "estado": "NS",
  "golesLocal": null,
  "golesVisitante": null,
  "grupo": "Grupo J",
  "ronda": "Grupo J",
  "sede": "Kansas City",
  "esMundial": true
}
```

Estados: `NS` → `1H / 2H / HT` → `FT / AET / PEN`

### `predicciones`

```json
{
  "userId": "google-oauth2|xxx",
  "partidoId": "ObjectId",
  "golesLocal": 2,
  "golesVisitante": 0,
  "puntos": null,
  "createdAt": "2026-05-01T...",
  "updatedAt": "2026-05-01T..."
}
```

### `usuarios`

```json
{
  "userId": "google-oauth2|xxx",
  "nombre": "Nicolas Agnello",
  "email": "nico@gmail.com",
  "foto": "url",
  "grupoId": "ObjectId",
  "grupoNombre": "Leibnitz 2026",
  "lastLogin": "2026-06-01T..."
}
```

### `grupos`

```json
{
  "nombre": "Leibnitz 2026",
  "codigo": "LEIBNITZ2026",
  "creadoAt": "2026-05-01T..."
}
```

---

## Deploy en Vercel

1. Subí el proyecto a GitHub
2. Entrá a https://vercel.com → **New Project** → importá el repo
3. Cargá todas las variables de entorno en **Settings → Environment Variables**
4. Deploy automático en cada push a `main`

### Auth0

1. Creá una Application de tipo _Single Page Application_
2. En **Allowed Callback URLs**, **Logout URLs** y **Web Origins** agregá la URL de Vercel
3. En **Authentication → Social** habilitá Google
4. Desactivá Username-Password, dejá solo Google

---

## Notas importantes

- **football-data.org free tier**: 10 req/min — el sync hace 1 request por ejecución
- **MongoDB M0**: hasta 512MB — suficiente para ~200 usuarios y ~20.000 predicciones
- **Predicciones bloqueadas**: el backend verifica `estado === 'NS'` y `fecha > now` antes de guardar
- **Anti-impersonación**: cada POST verifica el Bearer token contra Auth0 `/userinfo` y compara el `sub` con el `userId` del body
- **Bracket responsive**: usa `transform: scale()` automático según el ancho de pantalla

---

_Desarrollado para el Instituto Leibnitz — Villa María, Córdoba, Argentina_
