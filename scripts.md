-- limpieza

node scripts/limpiarArchivos.js

-- verificar entorno

node scripts/verificarEntorno.js

-- exportar estructura

tree -I "node_modules|.git" -L 3 > estructura.txt