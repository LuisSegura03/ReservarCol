# 🚀 Proxy PHP para Bold en Hostinger

## 📋 Configuración requerida

### 1. Estructura de archivos en Hostinger
Después de desplegar, tu estructura debería ser:
```
public_html/
├── index.html
├── assets/
├── proxy.php          ← Archivo PHP para crear links
├── check-status.php   ← Archivo PHP para verificar estado
├── .htaccess          ← Configuración del servidor
└── ...otros archivos...
```

### 2. Variables de entorno
En Hostinger, ve a **Sitios web > Administrador > Variables de entorno** y agrega:
```
BOLD_API_KEY=tu_clave_api_de_bold_aqui
```

### 3. Permisos de archivos
Asegúrate de que los archivos PHP tengan permisos **644**:
- `proxy.php` → 644
- `check-status.php` → 644
- `.htaccess` → 644

### 4. Configuración PHP
En Hostinger, ve a **Sitios web > Administrador** y configura:
- **Versión PHP**: 7.4 o superior
- **Variables personalizadas**: Agrega `BOLD_API_KEY`

## 🔧 Desarrollo vs Producción

El código detecta automáticamente el entorno:
- **Desarrollo**: Usa proxies de Vite (`/api/*`)
- **Producción**: Usa archivos PHP (`/proxy.php`, `/check-status.php`)

## 🧪 Testing

### Crear link de pago:
```bash
curl -X POST https://tu-dominio.com/proxy.php \
  -H "Content-Type: application/json" \
  -d '{"amount_type":"CLOSE","amount":{"currency":"COP","taxes":[],"tip_amount":0,"total_amount":100000},"reference":"test123","description":"Test payment"}'
```

### Verificar estado:
```bash
curl https://tu-dominio.com/check-status.php/payment_link_id_aqui
```

## ⚠️ Solución de problemas

### Error: "No se pudo parsear la respuesta como JSON"
- **Causa**: PHP no se está ejecutando, se está sirviendo como texto
- **Solución**:
  1. Verifica que los archivos estén en `public_html/`
  2. Confirma permisos 644
  3. Revisa que PHP esté habilitado en Hostinger
  4. Verifica el `.htaccess`

### Error: "Proxy error"
- **Causa**: Problema con cURL o API de Bold
- **Solución**: Revisa logs de PHP en Hostinger

### Error: CORS
- **Causa**: Headers CORS no configurados
- **Solución**: Verifica el `.htaccess` y configuración de Hostinger

## 🔍 Debugging

1. **Logs de Hostinger**: En el panel de control > Archivos > logs
2. **PHP error logs**: En `public_html/error_log`
3. **Test manual**: Usa curl para probar los endpoints PHP
4. **Variables de entorno**: Confirma que `BOLD_API_KEY` esté configurada