#!/bin/bash
# Script de despliegue para Hostinger con proxy PHP

echo "🚀 Iniciando despliegue para Hostinger..."

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Build de producción
echo "📦 Construyendo aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build"
    exit 1
fi

echo "✅ Build completado"

# Crear directorio de despliegue
DEPLOY_DIR="deploy-hostinger"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copiar archivos de producción
echo "📁 Copiando archivos..."
cp -r dist/* $DEPLOY_DIR/
cp public/proxy.php $DEPLOY_DIR/
cp public/check-status.php $DEPLOY_DIR/
cp public/test-env.php $DEPLOY_DIR/
cp public/create-env.php $DEPLOY_DIR/
cp public/.htaccess $DEPLOY_DIR/
cp .env-hostinger $DEPLOY_DIR/.env-example

# Crear archivo de configuración
cat > $DEPLOY_DIR/README-HOSTINGER.md << 'EOF'
# 📋 Configuración en Hostinger

## 1. Subir archivos
Sube todo el contenido de esta carpeta a `public_html/` en Hostinger.

## 2. Configurar variables de entorno
**Opción A: Panel de Hostinger**
En Hostinger > Sitios web > Administrador > Variables de entorno:
```
BOLD_API_KEY=tu_clave_api_de_bold_aqui
```

**Opción B: Archivo .env (recomendado para hosting compartido)**
1. **Método automático:** Visita `https://tu-dominio.com/create-env.php` para crear el archivo automáticamente
2. **Método manual:** Crea un archivo llamado `.env` en tu directorio `public_html/` con este contenido:

```
BOLD_API_KEY=kpLzvafnrXJuRQxuGbe51_gp03AAMlxsAQQVa8oV8d8
```

**Importante:** El archivo debe llamarse exactamente `.env` (con punto al inicio) y estar en la raíz de `public_html/`.

## 3. Verificar permisos
Asegúrate de que los archivos PHP tengan permisos 644:
- `proxy.php` → 644
- `check-status.php` → 644

## 4. Probar
Visita tu sitio y prueba crear un pago.

**Diagnóstico de variables de entorno:**
Visita `https://tu-dominio.com/test-env.php` para verificar si la API key se está leyendo correctamente.

## 🔧 Troubleshooting
- Si ves código PHP en lugar de JSON: Verifica permisos y configuración PHP
- Si hay errores CORS: Revisa el .htaccess
- Si no funciona la API: Verifica la variable BOLD_API_KEY
EOF

echo "📋 Creando archivo ZIP para Hostinger..."
cd $DEPLOY_DIR
zip -r ../reservar-colombia-hostinger.zip .
cd ..

echo "✅ Despliegue listo!"
echo ""
echo "📦 Archivo creado: reservar-colombia-hostinger.zip"
echo "📖 Lee las instrucciones en: deploy-hostinger/README-HOSTINGER.md"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Sube el ZIP a Hostinger"
echo "2. Extrae en public_html/"
echo "3. Configura BOLD_API_KEY"
echo "4. Prueba la aplicación"