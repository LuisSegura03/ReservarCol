# 📋 Configuración en Hostinger

## 1. Subir archivos
Sube todo el contenido de esta carpeta a `public_html/` en Hostinger.

## 2. Configurar variables de entorno

### ❌ **Por qué las variables del panel de Hostinger no funcionan:**
En hosting compartido, las variables configuradas desde el panel no siempre se pasan a PHP. Esto es común en Hostinger y otros hosting similares.

### ✅ **Soluciones que funcionan:**

**Opción A: Archivo .env automático (Recomendado)**
1. Visita: `https://tu-dominio.com/create-env.php`
2. Esto crea el archivo `.env` automáticamente

**Opción B: Archivo .env manual**
Crea un archivo `.env` en `public_html/` con:
```
BOLD_API_KEY=kpLzvafnrXJuRQxuGbe51_gp03AAMlxsAQQVa8oV8d8
```

**Opción C: Panel de Hostinger + reinicio**
Si insistes en usar el panel:
1. Configura `BOLD_API_KEY` en el panel
2. Contacta soporte de Hostinger para reiniciar PHP-FPM
3. Verifica con: `https://tu-dominio.com/test-env.php`

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
