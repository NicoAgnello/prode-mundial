# Prode Mundial 2026

Aplicación web de pronósticos para el FIFA World Cup 2026. Los usuarios predicen resultados de partidos, acumulan puntos y compiten en un ranking grupal.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Sistema de puntaje](#sistema-de-puntaje)
- [Sistema de grupos](#sistema-de-grupos)
- [Panel de administración](#panel-de-administración)
- [Sincronización automática](#sincronización-automática)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Deploy](#deploy)

---

## Descripción

Prode Mundial 2026 es una aplicación fullstack que permite a grupos de personas competir prediciendo los resultados del Mundial de Fútbol 2026 (México, USA y Canadá). Cada grupo tiene su propio ranking aislado. Los partidos se sincronizan automáticamente desde football-data.org via un cron de GitHub Actions, y los puntos se calculan solos al actualizarse los resultados.

**URL de producción**: https://prode-mundial-cpdo.vercel.app

---

## Funcionalidades

- **Autenticación** con Google via Auth0
- **Sistema de grupos** — cada grupo tiene su propio ranking separado con código de invitación
- **Predicciones** — los usuarios predicen el marcador exacto de cada partido antes de que empiece
- **Bloqueo automático** — las predicciones se bloquean cuando el partido arranca
- **Ranking grupal** — ordenado por puntos, con desempate por resultados exactos y ganadores acertados
- **Fase de grupos** — 72 partidos del Mundial 2026 precargados con banderas y fechas reales
- **Fase eliminatoria** — los cruces se van completando a medida que avanza el torneo
- **Sincronización automática** — cron cada 30 minutos durante el Mundial via GitHub Actions
- **Panel de administración** — gestión de partidos, usuarios y grupos
- **Responsive** — funciona en mobile y desktop

---

## Tecnologías

| Capa                  | Tecnología                     |
| --------------------- | ------------------------------ |
| Frontend              | React + Vite                   |
| Autenticación         | Auth0 (Google OAuth)           |
| Base de datos         | MongoDB Atlas M0               |
| Backend               | Vercel Serverless Functions    |
| API de resultados     | football-data.org (free tier)  |
| Cron automático       | GitHub Actions                 |
| Deploy                | Vercel (Hobby plan)            |
| Banderas              | flagcdn.com                    |

---

## Arquitectura

```
Browser (React SPA)
       │
       ├── Auth0 (autenticación Google)
       │
       ├── Vercel Serverless Functions (API)
       │         │
       │         ├── MongoDB Atlas (datos)
       │         └── football-data.org (resultados externos)
       │
       ├── flagcdn.com (imágenes de banderas)
       │
       └── GitHub Actions (cron cada 30 min durante el Mundial)
```

El backend corre como funciones serverless en Vercel. No hay servidor persistente — cada request levanta una función, ejecuta la lógica y responde. La conexión a MongoDB se reutiliza entre invocaciones para optimizar performance.

---

## Instalación

### 1. Cloná el repositorio

```bash
git clone https://github.com/NicoAgnello/prode-mundial
cd prode-mundial
```

### 2. Instalá las dependencias

```bash
npm install
```

### 3. Configurá las variables de entorno

```bash
cp .env.example .env.local
```

Completá el `.env.local` con tus credenciales (ver sección siguiente).

### 4. Corré en desarrollo

```bash
npm run dev
```

Abrí http://localhost:5173

> Para que las API routes funcionen en local necesitás la [Vercel CLI](https://vercel.com/docs/cli):
>
> ```bash
> npm i -g vercel
> vercel dev
> ```

---

## Variables de entorno

### Frontend (prefijo `VITE_`)

```env
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
```

### Backend (solo en servidor, sin prefijo)

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/prode-mundial
FOOTBALL_DATA_API_KEY=tu_api_key_de_football_data_org
ADMIN_USER_ID=google-oauth2|id_del_admin
CRON_SECRET=string_secreto_para_el_cron
```

### Cómo obtener cada variable

| Variable                  | Dónde obtenerla                                          |
| ------------------------- | -------------------------------------------------------- |
| `VITE_AUTH0_DOMAIN`       | Auth0 → Applications → Settings → Domain                |
| `VITE_AUTH0_CLIENT_ID`    | Auth0 → Applications → Settings → Client ID             |
| `MONGODB_URI`             | Atlas → Connect → Drivers → Connection String            |
| `FOOTBALL_DATA_API_KEY`   | football-data.org → cuenta gratuita → API token         |
| `ADMIN_USER_ID`           | Auth0 → User Management → Users → user_id del admin     |
| `CRON_SECRET`             | Cualquier string largo aleatorio (`openssl rand -hex 32`)|

### Variables en GitHub Actions

Para el cron automático, configurar en GitHub → Settings → Secrets and variables → Actions:

| Secret         | Valor                                          |
| -------------- | ---------------------------------------------- |
| `CRON_SECRET`  | El mismo valor que en Vercel                   |
| `VERCEL_URL`   | URL de producción (ej: https://prode.vercel.app)|

---

## Endpoints de la API

### Públicos

| Método | Endpoint                       | Descripción                            |
| ------ | ------------------------------ | -------------------------------------- |
| GET    | `/api/partidos`                | Listar todos los partidos              |
| GET    | `/api/predicciones?userId=xxx` | Predicciones de un usuario             |
| POST   | `/api/predicciones`            | Crear o actualizar predicción          |
| GET    | `/api/ranking?userId=xxx`      | Ranking filtrado por grupo del usuario |
| POST   | `/api/usuarios`                | Registrar o actualizar usuario         |
| GET    | `/api/grupos?userId=xxx`       | Info del grupo del usuario             |
| POST   | `/api/grupos`                  | Unirse a un grupo con código           |

### Admin (requieren header `x-admin-id` con el ADMIN_USER_ID)

| Método    | Endpoint                                        | Descripción                                        |
| --------- | ----------------------------------------------- | -------------------------------------------------- |
| POST      | `/api/admin/cargar-mundial`                     | Carga los 72 partidos de grupos                    |
| GET/POST  | `/api/admin/sincronizar`                        | Sincroniza resultados y calcula puntos automáticamente |
| GET       | `/api/admin/usuarios`                           | Lista todos los usuarios con stats                 |
| GET       | `/api/admin/predicciones-partido?partidoId=xxx` | Predicciones de un partido                         |
| POST      | `/api/admin/acciones`                           | Acciones varias (ver body)                         |

#### Acciones disponibles en `/api/admin/acciones`

```json
{ "action": "recalcular" }
{ "action": "limpiar-partidos" }
{ "action": "limpiar-predicciones", "userId": "opcional" }
{ "action": "resetear-puntos" }
{ "action": "crear-grupo", "nombre": "Leibnitz 2026", "codigo": "LEIBNITZ2026" }
{ "action": "listar-grupos" }
{ "action": "resetear-grupo", "userId": "google-oauth2|xxx" }
```

---

## Sistema de puntaje

| Resultado                                       | Puntos    |
| ----------------------------------------------- | --------- |
| Marcador exacto (ej: predijiste 2-1, salió 2-1) | **3 pts** |
| Acertaste ganador o empate pero no el marcador  | **1 pt**  |
| Error total                                     | **0 pts** |

**Desempate en ranking:** puntos totales → resultados exactos → ganadores acertados.

Los usuarios pueden modificar sus predicciones hasta que el partido arranca. Una vez que la fecha pasó, el estado cambia automáticamente y la predicción queda bloqueada.

---

## Sistema de grupos

Cada grupo tiene su propio ranking aislado. Los participantes de un grupo no ven el ranking de otros grupos.

**Flujo:**

1. El admin crea un grupo con nombre y código desde el Panel Admin
2. Comparte el código con los participantes (ej: `LEIBNITZ2026`)
3. Al entrar por primera vez, el usuario ingresa el código
4. Ve un preview del grupo antes de confirmar
5. Una vez unido, el código queda guardado para siempre
6. Si un usuario se equivoca de grupo, el admin puede resetearlo desde la sección Usuarios

---

## Panel de administración

Accesible en `/admin` solo para el usuario configurado como `ADMIN_USER_ID`.

### Sección Principal — flujo normal del Mundial

1. **Cargar Mundial 2026** → carga los 72 partidos de la fase de grupos (hacer una vez antes del torneo)
2. **Sincronizar resultados** → trae resultados de football-data.org, bloquea predicciones y calcula puntos. El cron lo corre automáticamente cada 30 min — este botón es para forzarlo manualmente.
3. **Limpiar partidos** → borra todo (solo para resetear, irreversible)

### Sección Usuarios

- Ver todos los usuarios registrados con stats (prodes cargados, puntos, grupo)
- Borrar predicciones de un usuario
- Resetear el grupo de un usuario

### Sección Partidos

- Ver todos los partidos en la DB con estado y resultado
- Ver qué pronosticó cada participante en un partido específico

### Sección Grupos

- Crear nuevos grupos con código de invitación
- Ver grupos existentes con cantidad de miembros

### Sección Utilidades

- **Recalcular puntos** → recalculo manual de emergencia (normalmente no hace falta)
- **Resetear todos los puntos** → pone puntos en null para recalcular desde cero
- **Borrar todas las predicciones** → acción irreversible

---

## Sincronización automática

Durante el período del Mundial (8 jun – 21 jul 2026), un workflow de GitHub Actions llama al endpoint `/api/admin/sincronizar` cada 30 minutos.

**Lo que hace cada ejecución:**

1. Busca partidos con `estado: NS` cuya fecha ya pasó → los pasa a `1H` (bloquea predicciones)
2. Consulta football-data.org por partidos con `status: FINISHED`
3. Para cada partido terminado que aún no figura como FT en la DB:
   - Guarda los goles
   - Calcula puntos de todas las predicciones de ese partido
4. Fuera del período del Mundial devuelve `omitido: true` sin hacer nada

**Configuración del cron** (`/.github/workflows/sincronizar-mundial.yml`):
- Schedule: `*/30 * * * *`
- Secrets necesarios: `CRON_SECRET` y `VERCEL_URL`

---

## Estructura del proyecto

```
prode-mundial/
├── .github/
│   └── workflows/
│       └── sincronizar-mundial.yml   # Cron automático cada 30 min
├── api/                              # Vercel Serverless Functions (backend)
│   ├── _db.js                        # Conexión a MongoDB (módulo compartido)
│   ├── partidos.js                   # GET partidos
│   ├── predicciones.js               # GET/POST predicciones
│   ├── ranking.js                    # GET ranking filtrado por grupo
│   ├── usuarios.js                   # POST registrar/actualizar usuario
│   ├── grupos.js                     # GET info grupo / POST unirse
│   └── admin/
│       ├── acciones.js               # POST acciones múltiples
│       ├── cargar-mundial.js         # POST cargar 72 partidos del Mundial
│       ├── sincronizar.js            # GET/POST sync con football-data.org
│       ├── usuarios.js               # GET lista usuarios con stats
│       └── predicciones-partido.js  # GET predicciones de un partido
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx            # Navbar + footer
│   │       └── Cargando.jsx          # Pantalla de carga
│   ├── hooks/
│   │   ├── useProde.js               # usePartidos, useRanking, useMisPredicciones
│   │   └── useRegistrarUsuario.js
│   ├── pages/
│   │   ├── Home.jsx                  # Landing con stats y explicación
│   │   ├── Partidos.jsx              # Cards de partidos con predicciones
│   │   ├── Cuadro.jsx                # Bracket eliminatorio
│   │   ├── Ranking.jsx               # Tabla de posiciones del grupo
│   │   ├── MisPredicciones.jsx       # Historial de predicciones del usuario
│   │   ├── Admin.jsx                 # Panel de administración
│   │   └── UnirseGrupo.jsx           # Pantalla de código de invitación
│   ├── styles/
│   │   └── global.css                # Variables CSS + estilos base
│   ├── App.jsx                       # Rutas + lógica de grupos
│   └── main.jsx
├── .env.example
├── vercel.json
├── vite.config.js
└── package.json
```

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

## Deploy

### Vercel

1. Subí el proyecto a GitHub
2. Entrá a https://vercel.com → **New Project** → importá el repo
3. Cargá todas las variables de entorno en **Settings → Environment Variables**
4. Deploy automático en cada push a `main`

> **Límite importante**: el plan Hobby de Vercel permite máximo **12 Serverless Functions**. Este proyecto usa **10**.

### Auth0

1. Creá una Application de tipo _Single Page Application_
2. En **Allowed Callback URLs**, **Logout URLs** y **Web Origins** agregá la URL de Vercel
3. En **Authentication → Social** habilitá Google
4. En **Applications → Connections** desactivá Username-Password y dejá solo Google

### GitHub Actions (cron)

1. En el repo de GitHub → **Settings → Secrets and variables → Actions**
2. Agregar `CRON_SECRET` (mismo valor que en Vercel) y `VERCEL_URL`
3. El workflow `.github/workflows/sincronizar-mundial.yml` se activa solo

---

## Notas importantes

- **football-data.org free tier**: 10 requests/minuto — el cron hace 1 request por ejecución, bien dentro del límite
- **MongoDB M0**: soporta hasta 512MB — más que suficiente para ~100 usuarios y ~10.000 predicciones
- **Predicciones bloqueadas**: el backend verifica `estado === 'NS'` antes de guardar. Si el partido ya empezó, rechaza la predicción
- **Ranking**: incluye a todos los usuarios con al menos una predicción cargada, aunque aún no haya partidos puntuados

---

_Desarrollado para el Instituto Leibnitz — Villa María, Córdoba, Argentina_
