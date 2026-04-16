#!/bin/bash

# Script para verificar configuración de Bold API
echo "Verificando configuración de Bold API..."

# Verificar variable de entorno
if [ -z "$BOLD_API_KEY" ]; then
    echo "❌ BOLD_API_KEY no está configurada en el entorno local"
    echo "   Configúrala con: export BOLD_API_KEY='tu_api_key'"
else
    echo "✅ BOLD_API_KEY está configurada localmente"
    echo "   Longitud: ${#BOLD_API_KEY} caracteres"
    echo "   Prefijo: ${BOLD_API_KEY:0:10}..."
fi

# Verificar que PHP puede acceder a la variable
echo ""
echo "Probando acceso desde PHP..."
php -r "
\$apiKey = getenv('BOLD_API_KEY');
if (empty(\$apiKey)) {
    echo \"❌ PHP no puede acceder a BOLD_API_KEY\n\";
} else {
    echo \"✅ PHP puede acceder a BOLD_API_KEY\n\";
    echo \"   Longitud: \" . strlen(\$apiKey) . \" caracteres\n\";
    echo \"   Prefijo: \" . substr(\$apiKey, 0, 10) . \"...\n\";
}
"

# Verificar conectividad a Bold API
echo ""
echo "Probando conectividad a Bold API..."
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" https://integrations.api.bold.co/online/link/v1)
    if [ "$response" = "401" ]; then
        echo "✅ Endpoint accesible (401 Unauthorized esperado sin auth)"
    elif [ "$response" = "000" ]; then
        echo "❌ No se puede conectar al endpoint"
    else
        echo "⚠️  Respuesta inesperada: $response"
    fi
else
    echo "❌ curl no está disponible"
fi

echo ""
echo "Para producción en Hostinger:"
echo "1. Ve a tu panel de Hostinger"
echo "2. Configuración > Variables de entorno"
echo "3. Agrega: BOLD_API_KEY = tu_clave_api_de_bold"
echo "4. Reinicia la aplicación si es necesario"