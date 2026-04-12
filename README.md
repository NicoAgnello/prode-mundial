# 🏆 Prode Mundial 2026

App de pronósticos del Mundial para el curso del Instituto Leibnitz.

## Stack

- **Frontend**: React + Vite
- **Auth**: Auth0
- **Base de datos**: MongoDB Atlas M0 (gratis)
- **Backend**: Vercel API Routes (serverless)
- **API de resultados**: API-Football (free tier)
- **Deploy**: Vercel

---

## Setup paso a paso

### 1. MongoDB Atlas

1. Entrá a https://mongodb.com/atlas y creá una cuenta gratuita
2. Creá un proyecto nuevo y dentro un **cluster M0 (gratis)**
3. En **Database Access** → creá un usuario con usuario y contraseña
4. En **Network Access** → agregá `0.0.0.0/0` (permite cualquier IP, OK para desarrollo)
5. En el cluster → **Connect** → **Drivers** → copiá el connection string:
   ```
   mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Reemplazá `<usuario>` y `<password>` con los datos que creaste

### 2. Auth0

1. Entrá a https://auth0.com y creá una cuenta gratuita
2. Creá una **Application** del tipo *Single Page Application*
3. En Settings copiá:
   - **Domain** → `VITE_AUTH0_DOMAIN`
   - **Client ID** → `VITE_AUTH0_CLIENT_ID`
4. En **Allowed Callback URLs**, **Allowed Logout URLs** y **Allowed Web Origins** agregá:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: `https://tu-app.vercel.app`

### 3. API-Football

1. Registrate en https://dashboard.api-football.com (gratis, sin tarjeta)
2. Copiá tu API Key del dashboard

### 4. Variables de entorno locales

Creá un archivo `.env.local` en la raíz (nunca lo subas a Git):

```env
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
VITE_ADMIN_EMAIL=tu@email.com

MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/prode-mundial
API_FOOTBALL_KEY=tu_api_key_aqui
ADMIN_SECRET=una_clave_secreta_cualquiera
```

### 5. Instalar y correr local

```bash
npm install
npm run dev
```

Abrí http://localhost:5173

### 6. Deploy en Vercel

1. Subí el proyecto a GitHub
2. Entrá a https://vercel.com → **New Project** → importá tu repo
3. En **Environment Variables** cargá todas las variables del `.env.local` (sin el prefijo VITE_ para las del servidor)
4. Deploy 🚀

---

## Colecciones de MongoDB

### `partidos`
```json
{
  "fixtureId": 123456,
  "local": "Argentina",
  "visitante": "Francia",
  "banderaLocal": "url",
  "banderaVisitante": "url",
  "fecha": "2026-07-19T20:00:00Z",
  "estado": "NS",
  "golesLocal": null,
  "golesVisitante": null,
  "grupo": "Matchday 1",
  "ronda": "Group Stage"
}
```

### `predicciones`
```json
{
  "userId": "auth0|xxxx",
  "partidoId": ObjectId("..."),
  "golesLocal": 2,
  "golesVisitante": 1,
  "puntos": null
}
```

### `usuarios`
```json
{
  "userId": "auth0|xxxx",
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "foto": "url",
  "createdAt": "2026-06-01T..."
}
```

---

## Sistema de puntaje

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: predijiste 2-1, salió 2-1) | **3 pts** |
| Acertaste el ganador pero no el marcador | **1 pt** |
| Error total | **0 pts** |

---

## Sincronizar resultados

Una vez que hay partidos terminados, desde el **Panel Admin**:
1. Clic en **Sincronizar resultados** → trae los datos de API-Football
2. Clic en **Recalcular puntos** → actualiza los puntos de todos

También podés hacerlo via curl:
```bash
curl -X POST https://tu-app.vercel.app/api/admin/sincronizar \
  -H "x-admin-key: tu_admin_secret"

curl -X POST https://tu-app.vercel.app/api/admin/recalcular \
  -H "x-admin-key: tu_admin_secret"
```

---

## Estructura del proyecto

```
prode-mundial/
├── api/                    # Vercel API Routes (backend)
│   ├── _db.js              # Conexión a MongoDB
│   ├── partidos.js         # GET partidos
│   ├── predicciones.js     # GET/POST predicciones
│   ├── ranking.js          # GET ranking
│   ├── usuarios.js         # POST registrar usuario
│   └── admin/
│       ├── sincronizar.js  # POST sync API-Football
│       └── recalcular.js   # POST recalcular puntos
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx  # Navbar + footer
│   │       └── Cargando.jsx
│   ├── hooks/
│   │   ├── useProde.js     # Hooks de datos
│   │   └── useRegistrarUsuario.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Partidos.jsx
│   │   ├── Ranking.jsx
│   │   ├── MisPredicciones.jsx
│   │   └── Admin.jsx
│   ├── styles/
│   │   └── global.css      # Variables CSS + estilos base
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .env.local              # ← crearlo vos, nunca subir a Git
├── vercel.json
├── vite.config.js
└── package.json
```
