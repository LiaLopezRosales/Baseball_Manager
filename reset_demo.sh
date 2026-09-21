#!/usr/bin/env bash
# reset_demo.sh — vuelve a dejar el proyecto en estado "demo recién instalada".
#
# Qué hace (en orden para que sea reproducible desde un clon limpio):
#   1. Descarta los cambios de BD pegados al repo (flush) y re-aplica migraciones.
#   2. Re-siembra el campeonato, usuarios demo y notificaciones con populate_db.py.
#   3. Limpia localStorage/estado del navegador? No: limpia solo datos que el
#      seed regenera (token en BD). El frontend conserva el tema elegido.
#
# Uso (desde la raíz del repo):
#   ./reset_demo.sh
#
# Requiere: venv activado con dependencias instaladas, Postgres levantado y la
# configuración de BD como en .env (mirar .env.example).
set -euo pipefail

cd "$(dirname "$0")"

# 1. Entorno de Python (compatible con nombres del repo)
if [ -d pyvenv ] || [ -d python_enviroment ] || [ -d python_environment ] || [ -d python_enviroments ] || [ -d venv ]; then
  for _v in python_enviroment python_environment python_enviroments venv pyvenv; do
    if [ -d "$_v" ]; then
      echo "→ Activando venv: $_v"
      # shellcheck disable=SC1091
      source "$_v/bin/activate"
      break
    fi
  done
else
  echo "⚠️  No encontré un virtualenv en (pyvenv|python_enviroment|python_environment|python_enviroments|venv)."
  echo "   Crea uno e instala deps antes:"
  echo "   python3 -m venv pyvenv && source pyvenv/bin/activate && pip install -e ."
  exit 1
fi

# 2. Asegurar migraciones aplicadas en el estado correcto
echo "→ Descartando datos de la base actual (flush)…"
python manage.py flush --no-input

echo "→ Re-aplicando migraciones…"
python manage.py migrate --noinput

# 3. Sembrar datos demo (equipos, jugadores, campeonato, usuarios, notis)
echo "→ Sembrando campeonato demo (populate_db.py)…"
python populate_db.py

echo ""
echo "✅ Demo lista."
echo "   Backend:  python manage.py runserver   (http://localhost:8000)"
echo "   Frontend: cd Baseball_Management && npm start   (http://localhost:3000)"
echo ""
echo "   Usuarios demo:"
echo "   - Admin:            lialopez@gmail.com / lia"
echo "   - Director Técnico: director@test.com / director"
echo "   - Usuario General:  general@test.com / general"
