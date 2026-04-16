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
