# 🏆 Prode Mundial 2026

Aplicación web de pronósticos para el FIFA World Cup 2026. Los usuarios predicen resultados de partidos, acumulan puntos y compiten en un ranking grupal en tiempo real.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Funcionalidades](#-funcionalidades)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Sistema de puntaje](#-sistema-de-puntaje)
- [Sistema de grupos](#-sistema-de-grupos)
- [Panel de administración](#-panel-de-administración)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Deploy](#-deploy)

---

## 📖 Descripción

Prode Mundial 2026 es una aplicación fullstack que permite a grupos de personas competir prediciendo los resultados del Mundial de Fútbol 2026 (México, USA y Canadá). Cada grupo tiene su propio ranking aislado, los partidos se sincronizan automáticamente desde API-Football, y los puntos se recalculan desde el panel de administración.

**URL de producción**: https://prode-mundial-cpdo.vercel.app

---

## ✨ Funcionalidades

- **Autenticación** con Google via Auth0
- **Sistema de grupos** — cada grupo tiene su propio ranking separado con código de invitación
- **Predicciones** — los usuarios predicen el marcador exacto de cada partido antes de que empiece
- **Ranking en tiempo real** — ordenado por puntos, con desempate por resultados exactos y ganadores acertados
- **Fase de grupos** — 72 partidos del Mundial 2026 precargados con banderas y fechas reales
- **Fase eliminatoria** — los cruces se van completando a medida que la API devuelve clasificados
- **Panel de administración** — sincronización de resultados, gestión de usuarios y grupos
- **Responsive** — funciona en mobile y desktop

---

## 🛠 Tecnologías

| Capa              | Tecnología                  |
| ----------------- | --------------------------- |
| Frontend          | React + Vite                |
| Autenticación     | Auth0 (Google OAuth)        |
| Base de datos     | MongoDB Atlas M0            |
| Backend           | Vercel Serverless Functions |
| API de resultados | API-Football (free tier)    |
| Deploy            | Vercel (Hobby plan)         |
| Banderas          | flagcdn.com (gratis)        |

---

## 🏗 Arquitectura

```
Browser (React SPA)
       │
       ├── Auth0 (autenticación Google)
       │
       ├── Vercel Serverless Functions (API)
       │         │
       │         ├── MongoDB Atlas (datos)
       │         └── API-Football (resultados externos)
       │
       └── flagcdn.com (imágenes de banderas)
```

El backend corre como funciones serverless en Vercel. No hay servidor persistente — cada request levanta una función, ejecuta la lógica y responde. La conexión a MongoDB se reutiliza entre invocaciones para optimizar performance.

---

## 📦 Instalación

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

## ⚙️ Variables de entorno

### Frontend (prefijo `VITE_`)

```env
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
```

### Backend (solo en servidor, sin prefijo)

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/prode-mundial
API_FOOTBALL_KEY=tu_api_key
ADMIN_SECRET=clave_secreta_admin
ADMIN_USER_ID=google-oauth2|id_del_admin
```

### Cómo obtener cada variable

| Variable               | Dónde obtenerla                                     |
| ---------------------- | --------------------------------------------------- |
| `VITE_AUTH0_DOMAIN`    | Auth0 → Applications → Settings → Domain            |
| `VITE_AUTH0_CLIENT_ID` | Auth0 → Applications → Settings → Client ID         |
| `MONGODB_URI`          | Atlas → Connect → Drivers → Connection String       |
| `API_FOOTBALL_KEY`     | dashboard.api-football.com → API Key                |
| `ADMIN_SECRET`         | Cualquier string secreto                            |
| `ADMIN_USER_ID`        | Auth0 → User Management → Users → user_id del admin |

---

## 📚 Endpoints de la API

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

### Admin (requieren `userId` del admin en el body)

| Método | Endpoint                                        | Descripción                              |
| ------ | ----------------------------------------------- | ---------------------------------------- |
| POST   | `/api/admin/cargar-mundial`                     | Carga los 72 partidos de grupos          |
| POST   | `/api/admin/sincronizar`                        | Sincroniza resultados desde API-Football |
| POST   | `/api/admin/actualizar-estados`                 | Actualiza estados de partidos en juego   |
| GET    | `/api/admin/usuarios`                           | Lista todos los usuarios con stats       |
| GET    | `/api/admin/predicciones-partido?partidoId=xxx` | Predicciones de un partido               |
| POST   | `/api/admin/acciones`                           | Acciones varias (ver body)               |

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

## 🎯 Sistema de puntaje

| Resultado                                       | Puntos    |
| ----------------------------------------------- | --------- |
| Marcador exacto (ej: predijiste 2-1, salió 2-1) | **3 pts** |
| Acertaste ganador o empate pero no el marcador  | **1 pt**  |
| Error total                                     | **0 pts** |

**Desempate en ranking:** puntos totales → resultados exactos → ganadores acertados.

Los usuarios pueden modificar sus predicciones hasta que el partido empieza. Una vez que el estado cambia de `NS` (not started), la predicción queda bloqueada.

---

## 👥 Sistema de grupos

Cada grupo tiene su propio ranking aislado. Los participantes de un grupo no ven el ranking de otros grupos.

**Flujo:**

1. El admin crea un grupo con nombre y código desde el Panel Admin
2. Comparte el código con los participantes (ej: `LEIBNITZ2026`)
3. Al entrar por primera vez, el usuario ingresa el código
4. Ve un preview del grupo antes de confirmar
5. Una vez unido, el código queda guardado para siempre
6. Si un usuario se equivoca de grupo, el admin puede resetearlo desde la sección Usuarios

---

## 🔧 Panel de administración

Accesible en `/admin` solo para el email configurado en `ADMIN_USER_ID`.

### Sección Principal — flujo normal del Mundial

1. **Cargar Mundial 2026** → carga los 72 partidos de la fase de grupos
2. **Sincronizar resultados** → trae resultados de API-Football (usarlo después de cada fecha)
3. **Recalcular puntos** → actualiza el ranking (usarlo siempre después de sincronizar)
4. **Limpiar partidos** → borra todo (solo para resetear, irreversible)

### Sección Usuarios

- Ver todos los usuarios registrados con stats (prodes cargados, puntos, grupo)
- Borrar predicciones de un usuario
- Resetear el grupo de un usuario

### Sección Partidos

- Ver todos los partidos en la DB
- Ver qué pronosticó cada participante en un partido específico

### Sección Grupos

- Crear nuevos grupos con código de invitación
- Ver grupos existentes con cantidad de miembros

### Sección Utilidades

- Resetear todos los puntos (para recalcular desde cero)
- Borrar todas las predicciones

---

## 📁 Estructura del proyecto

```
prode-mundial/
├── api/                          # Vercel Serverless Functions (backend)
│   ├── _db.js                    # Conexión a MongoDB (reutilizable)
│   ├── partidos.js               # GET partidos
│   ├── predicciones.js           # GET/POST predicciones
│   ├── ranking.js                # GET ranking filtrado por grupo
│   ├── usuarios.js               # POST registrar/actualizar usuario
│   ├── grupos.js                 # GET info grupo / POST unirse
│   └── admin/
│       ├── acciones.js           # POST acciones múltiples (recalcular, limpiar, grupos)
│       ├── cargar-mundial.js     # POST cargar 72 partidos del Mundial 2026
│       ├── sincronizar.js        # POST sync con API-Football
│       ├── actualizar-estados.js # POST actualizar estados en vivo
│       ├── usuarios.js           # GET lista usuarios con stats
│       └── predicciones-partido.js # GET predicciones de un partido
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx        # Navbar + footer
│   │       └── Cargando.jsx      # Pantalla de carga
│   ├── hooks/
│   │   ├── useProde.js           # usePartidos, useRanking, useMisPredicciones
│   │   └── useRegistrarUsuario.js
│   ├── pages/
│   │   ├── Home.jsx              # Landing con stats y explicación
│   │   ├── Partidos.jsx          # Cards de partidos con predicciones
│   │   ├── Cruces.jsx            # Bracket eliminatorio
│   │   ├── Ranking.jsx           # Tabla de posiciones del grupo
│   │   ├── MisPredicciones.jsx   # Historial de predicciones del usuario
│   │   ├── Admin.jsx             # Panel de administración
│   │   └── UnirseGrupo.jsx       # Pantalla de código de invitación
│   ├── styles/
│   │   └── global.css            # Variables CSS + estilos base
│   ├── App.jsx                   # Rutas + lógica de grupos
│   └── main.jsx
├── .env.example
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🗄 Colecciones de MongoDB

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
  "esMundial": true,
  "fixtureId": null
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

## 🚀 Deploy

### Vercel (recomendado)

1. Subí el proyecto a GitHub
2. Entrá a https://vercel.com → **New Project** → importá el repo
3. Cargá todas las variables de entorno en **Settings → Environment Variables**
4. Deploy automático en cada push a `main`

> **Límite importante**: el plan Hobby de Vercel permite máximo **12 Serverless Functions**. Este proyecto usa exactamente 10.

### Auth0

1. Creá una Application de tipo _Single Page Application_
2. En **Allowed Callback URLs**, **Logout URLs** y **Web Origins** agregá la URL de Vercel
3. En **Authentication → Social** habilitá Google
4. En **Applications → Connections** desactivá Username-Password y dejá solo Google

---

## 📝 Notas importantes

- **API-Football free tier**: 100 requests/día — suficiente si sincronizás manualmente 1-2 veces por día durante el Mundial
- **MongoDB M0**: soporta hasta 512MB — más que suficiente para ~100 usuarios y ~10.000 predicciones
- **El `fixtureId`** empieza en `null` para todos los partidos. Al sincronizar por primera vez, se matchea por nombre de equipo y se agrega el ID real de API-Football
- **Predicciones bloqueadas**: el backend verifica que `estado === 'NS'` antes de guardar. Si el partido ya empezó, rechaza la predicción

---

_Desarrollado para el Instituto Leibnitz — Villa María, Córdoba, Argentina 🇦🇷_
