#!/bin/bash

# Script para probar el proxy PHP localmente
echo "Probando proxy PHP localmente..."

# Verificar que el archivo proxy.php existe
if [ ! -f "public/proxy.php" ]; then
    echo "Error: proxy.php no encontrado en public/"
    exit 1
fi

# Verificar que PHP está instalado
if ! command -v php &> /dev/null; then
    echo "Error: PHP no está instalado"
    exit 1
fi

echo "PHP encontrado: $(php --version | head -1)"

# Verificar que las variables de entorno están configuradas
if [ -z "$BOLD_API_KEY" ]; then
    echo "Advertencia: BOLD_API_KEY no está configurada"
else
    echo "BOLD_API_KEY está configurada"
fi

# Probar el proxy con una petición de prueba
echo "Probando petición al proxy..."
curl -X POST http://localhost:5173/proxy.php \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "COP",
    "description": "Test payment",
    "reference": "test-123"
  }' \
  -v

echo ""
echo "Prueba completada. Revisa los logs de PHP para más detalles."