# Plan de Implementación: Funcionalidades para Usuario General

> **Fecha:** 2026-09-04
> **Objetivo:** Convertir "Usuario General" en un rol con valor real, diferenciando
> usuarios registrados de invitados con 7 funcionalidades concretas + página de
> registro + botón de logout accesible.

---

## Resumen Ejecutivo

| Fase | Descripción | ArchivosBackend | ArchivosFrontend |
|------|-------------|-----------------|------------------|
| 1 | Backend: modelos y endpoints | ~7 | 0 |
| 2 | Página de registro | 1 | 2 |
| 3 | Sistema de favoritos | 2 | 3 |
| 4 | Dashboard personalizado | 1 | 2 |
| 5 | Comparar jugadores | 0 | 2 |
| 6 | Notificaciones | 2 | 2 |
| 7 | Export solo para registrados | 1 | 1 |
| 8 | Botón de logout accesible | 0 | 2 |
| 9 | Usuarios de prueba | 1 | 0 |

**Total estimado:** ~15 archivos backend, ~14 archivos frontend, ~5 modificaciones.

---

## Fase 1: Backend — Modelos y Endpoints

### 1.1 Modelos nuevos (`db_structure/models.py`)

```python
class FavoriteTeam(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    team = models.ForeignKey('Team', on_delete=models.CASCADE)
    class Meta:
        constraints = [UniqueConstraint(fields=['user', 'team'])]

class FavoritePlayer(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    player = models.ForeignKey('BaseballPlayer', on_delete=models.CASCADE)
    class Meta:
        constraints = [UniqueConstraint(fields=['user', 'player'])]

class Notification(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 1.2 Serializers nuevos (`db_structure/serializers.py`)

- `FavoriteTeamSerializer`
- `FavoritePlayerSerializer`
- `NotificationSerializer`
- `RegisterSerializer` (nombre, lastname, email, password)

### 1.3 ViewSets nuevos (`db_structure/views.py` + repositorios)

Siguiendo el patrón existente (`Model` → `Repository` → `Serializer` → `ViewSet`):

- `FavoriteTeamViewSet` — CRUD propio (el usuario solo ve/crea/borra sus favoritos)
- `FavoritePlayerViewSet` — CRUD propio
- `NotificationViewSet` — solo list + update (marcar leído)

### 1.4 Endpoints nuevos en `api/views.py`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /api/register/` | POST | Registro: crea Person + User con rol "Usuario General" |
| `GET /api/user/dashboard/` | GET | Datos del dashboard personalizado del usuario |
| `GET /api/notifications/` | GET | Notificaciones del usuario autenticado |
| `POST /api/notifications/{id}/read/` | POST | Marcar notificación como leída |
| `GET /api/user/favorites/` | GET | Todos los favoritos del usuario (equipos + jugadores) |
| `POST /api/user/favorites/team/` | POST | Agregar/quitar equipo favorito |
| `POST /api/user/favorites/player/` | POST | Agregar/quitar jugador favorito |

### 1.5 Endpoints modificados

- `POST /api/queries/export/` — Verificar que el usuario esté autenticado (token válido). Si no, rechazar con 401.

### 1.6 Registro en URLs

- `Baseball_Manager/urls.py` — agregar ViewSets al router
- `api/urls.py` — agregar rutas custom

---

## Fase 2: Página de Registro

### 2.1 Nuevo componente `Register.jsx`

- Formulario con 4 campos: Nombre, Apellido, Email, Contraseña
- Mismo estilo glass-card que el login (`login.css` patrones)
- Botón "Crear cuenta"
- Link "¿Ya tienes cuenta? Iniciar sesión"
- POST a `/api/register/`
- En éxito: login automático + redirección a `/`

### 2.2 Nuevo archivo `register.css`

- Reutilizar patrones de `login.css` (glass card, inputs con iconos, focus states)

### 2.3 Modificar `login.jsx`

- Añadir link "¿No tienes cuenta? Regístrate" debajo del botón de login

### 2.4 Modificar `App.js`

- Añadir ruta `<Route path="/registro" element={<Register />} />`

---

## Fase 3: Sistema de Favoritos

### 3.1 Nuevo componente `FavoritesPanel.jsx`

- Panel con equipos y jugadores favoritos del usuario
- Botón "♥" para agregar desde landing o perfiles
- Botón "×" para eliminar

### 3.2 Modificar `Landing.jsx`

- Si el usuario está logueado: mostrar sección "Tus Favoritos"
- Botón de "♥" en cada fila de standings y card de líder/estrella

### 3.3 Modificar `profilePages.jsx`

- `TeamProfile`: botón "♥ Seguir equipo"
- `PlayerProfile`: botón "♥ Seguir jugador"

### 3.4 Nuevo archivo `favorites.css`

---

## Fase 4: Dashboard Personalizado

### 4.1 Nuevo componente `UserDashboard.jsx`

Visible solo para usuarios logueados:

- **Header:** "Bienvenido, {nombre}"
- **Posición en standings:** Tabla resaltando el equipo favorito
- **Últimos partidos del equipo:** Resultados recientes
- **Jugadores estrella del equipo:** Cards con efectividad
- **Radar chart del jugador favorito:** Reutilizar `RadarChart.jsx`

### 4.2 Nuevo archivo `userDashboard.css`

### 4.3 Modificar `Landing.jsx`

- Si `isLogged && role === 'Usuario General'`: renderizar `UserDashboard` + favoritos
- Si no: landing pública actual

### 4.4 Modificar `App.js`

- Pasar `role` e `isLogged` a `Landing`

---

## Fase 5: Comparar Jugadores

### 5.1 Nuevo componente `PlayerCompare.jsx`

- Selector de 2+ jugadores
- Radar chart con stats superpuestas (multi-series)
- Tabla comparativa lado a lado

### 5.2 Nuevo archivo `playerCompare.css`

### 5.3 Modificar `App.js`

- Añadir ruta `/comparar` (protegida)

### 5.4 Modificar sidebar o dashboard

- Link "Comparar jugadores" para usuarios logueados

---

## Fase 6: Notificaciones

### 6.1 Nuevo componente `NotificationBell.jsx`

- Icono campana (lucide `Bell`) con badge de contador
- Click abre dropdown con lista de notificaciones
- Botón "Marcar todas como leídas"

### 6.2 Modificar `App.js` o `sidebar.jsx`

- Añadir `NotificationBell` en el header
- Solo visible para usuarios logueados

### 6.3 Backend: crear notificaciones

- Cuando se registra un resultado de un equipo favorito → crear notificación
- Signal o modify en el endpoint de scores

### 6.4 Nuevo archivo `notifications.css`

---

## Fase 7: Export solo para Registrados

### 7.1 Modificar `report.jsx`

- Botón "Exportar" solo visible si `isLogged`
- Si no: tooltip "Inicia sesión para exportar"

### 7.2 Modificar `api/views.py` (ExportView)

- Verificar token de autenticación → 401 si no hay token

---

## Fase 8: Botón de Logout Accesible

### Problema actual

El logout solo está dentro del modal de login (click "Cuenta" → modal → "Cerrar sesión").
No hay forma visible de cerrar sesión sin abrir el modal.

### Solución

Añadir botón de logout en el sidebar footer cuando el usuario está logueado:

- **Sidebar footer:** reemplazar "Cuenta Invitado" por "Cerrar sesión" + nombre del usuario
- El botón ejecuta la misma lógica de `handleLogout` del login
- Visible para todos los roles logueados (Admin, DT, UG)

### 8.1 Modificar `sidebar.jsx`

- Cuando `role` no es vacío: mostrar nombre del usuario + botón "Cerrar sesión"
- Cuando es invitado: mantener "Cuenta Invitado" actual

### 8.2 Modificar `App.js`

- Pasar `isLogged`, `userName` y `handleLogout` al sidebar

### 8.3 Nuevo archivo o sección en `sidebar.css`

- Estilos para el botón de logout en el sidebar

---

## Fase 9: Usuarios de Prueba

### 9.1 Script de creación

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `lialopez@gmail.com` | `lia` | Admin (ya existe) |
| `director@test.com` | `director` | Director Técnico |
| `general@test.com` | `general` | Usuario General |

### 9.2 Modificar `populate_db.py`

- Añadir los 3 usuarios conocidos al final de `populate_users_and_workers()`

---

## Orden de Implementación

| Paso | Fase | Dependencias | Prioridad |
|------|------|-------------|-----------|
| 1 | Fase 1 (Backend) | Ninguna | Alta |
| 2 | Fase 9 (Usuarios prueba) | Fase 1 | Alta |
| 3 | Fase 2 (Registro) | Fase 1 | Alta |
| 4 | Fase 8 (Logout) | Ninguna | Alta |
| 5 | Fase 3 (Favoritos) | Fase 1 | Alta |
| 6 | Fase 7 (Export) | Fase 1 | Media |
| 7 | Fase 4 (Dashboard) | Fase 3 | Media |
| 8 | Fase 6 (Notificaciones) | Fase 1 | Media |
| 9 | Fase 5 (Comparar) | Fase 3 | Baja |

---

## Archivos Afectados

### Backend nuevos:
- `db_structure/models.py` — 3 modelos
- `db_structure/serializers.py` — 4 serializers
- `db_structure/views.py` — 3 ViewSets
- `db_structure/repositories.py` — 3 repositorios
- `api/views.py` — RegisterView, DashboardView, notificaciones, modificar ExportView
- `api/urls.py` — rutas nuevas
- `Baseball_Manager/urls.py` — registros en router

### Frontend nuevos:
- `src/components/Register.jsx` + `register.css`
- `src/components/UserDashboard.jsx` + `userDashboard.css`
- `src/components/PlayerCompare.jsx` + `playerCompare.css`
- `src/components/FavoritesPanel.jsx` + `favorites.css`
- `src/components/NotificationBell.jsx` + `notifications.css`

### Frontend modificados:
- `src/App.js` — rutas, props, logout
- `src/components/Landing.jsx` — contenido personalizado
- `src/components/login.jsx` — link a registro
- `src/components/sidebar.jsx` — logout, opciones de usuario
- `src/components/profilePages.jsx` — botones de favorito
- `src/components/report.jsx` — export condicional
- `src/components/ui/RadarChart.jsx` — multi-series

### Otros:
- `populate_db.py` — usuarios de prueba
- `AGENTS.md` — documentar nuevos endpoints

---

## Estado de Implementación (04-Sep-2026)

| Fase | Estado |
|---|---|
| 1 — Backend (modelos/endpoints) | ✅ Implementada |
| 9 — Usuarios de prueba | ✅ Implementada |
| 2 — Registro | ✅ Implementada |
| 8 — Logout accesible | ✅ Implementada |
| 3 — Favoritos | ✅ Implementada |
| 7 — Export solo registrados | ✅ Implementada |
| 4 — Dashboard | ✅ Implementada |
| 6 — Notificaciones | ✅ Implementada |
| 5 — Comparar jugadores | ❌ **Cancelada** (prioridad baja) |

### Verificación final
- `python manage.py check` → sin problemas.
- `python manage.py test db_structure` → **91 tests OK**.
- `npx react-scripts build` → OK.
- Verificación E2E (Playwright): login UG muestra "Tu panel", favoritos con estado (Agregar/Quitar), campana de notificaciones con badge y "Marcar leídas", logout desde sidebar limpia localStorage.
- Verificación curl: dashboard con favorito, toggle favoritos, notifications + read-all, export (401 sin token / 200 con token).

### Diferencias vs. lo planeado
- `CustomUser.is_active = None` rompía `TokenAuthentication` → se creó `api/authentication.py` con `FlexibleTokenAuthentication`.
- `RegisterView` usa `CustomUser` (el `Token` FK lo exige), no `db_structure.User`.
- Dashboard usa `Game`/`TeamOnTheField` (el modelo `Score` no tiene campo `game`).
- Los modelos `FavoriteTeam`/`FavoritePlayer`/`Notification` filtran por `user_id` (FK a `db_structure.User`).
- Auto-generación de notificaciones al registrar resultados (Fase 6.3) **pendiente** — se crean manualmente por ahora.
- `PlayerCompare.jsx` (Fase 5) no se implementó por prioridad baja.
