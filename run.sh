#!/bin/bash

# Moverse a la carpeta del frontend
cd ./Baseball_Management

# Ejecutar npm start
echo "Iniciando la aplicaci�n..."
npm start

# Esperar que el usuario presione Ctrl+C
trap 'echo "Cerrando la aplicaci�n..."; cd ..; exit' SIGINT

# Mantener el script activo hasta interrupci�n manual
wait

# Volver a la carpeta principal del proyecto
cd ..
