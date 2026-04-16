<?php
// check-status.php - Bold Status Check Proxy para Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Obtener paymentLinkId de la URL
$requestUri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim($requestUri, '/'));
$paymentLinkId = end($pathParts);

if (!$paymentLinkId || strlen($paymentLinkId) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payment link ID']);
    exit();
}

// Configuración de Bold API
$boldApiUrl = 'https://integrations.api.bold.co/online/link/v1/' . $paymentLinkId;

function getEnvValue(string $name): ?string {
    // Intentar múltiples fuentes para variables de entorno en hosting compartido
    if (isset($_ENV[$name]) && $_ENV[$name] !== '') {
        error_log("Found $name in \$_ENV");
        return $_ENV[$name];
    }
    if (isset($_SERVER[$name]) && $_SERVER[$name] !== '') {
        error_log("Found $name in \$_SERVER");
        return $_SERVER[$name];
    }
    $value = getenv($name);
    if ($value !== false && $value !== '') {
        error_log("Found $name via getenv()");
        return $value;
    }

    // En algunos hosting, las variables están en archivos .env
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ($key === $name && $val !== '') {
                error_log("Found $name in .env file");
                return $val;
            }
        }
    }

    error_log("$name not found in any source");
    return null;
}

$apiKey = getEnvValue('BOLD_API_KEY');

$apiKeySource = [];
if (isset($_ENV['BOLD_API_KEY'])) { $apiKeySource[] = 'ENV'; }
if (isset($_SERVER['BOLD_API_KEY'])) { $apiKeySource[] = 'SERVER'; }
if (getenv('BOLD_API_KEY') !== false) { $apiKeySource[] = 'getenv'; }
error_log('BOLD_API_KEY source: ' . implode(', ', array_unique($apiKeySource)));
error_log('BOLD_API_KEY set: ' . ($apiKey ? 'YES' : 'NO'));

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'BOLD_API_KEY no encontrada en el entorno del servidor']);
    exit();
}

// Headers para Bold
$headers = [
    'Authorization: x-api-key ' . $apiKey
];

// Inicializar cURL
$ch = curl_init($boldApiUrl);
curl_setopt($ch, CURLOPT_HTTPGET, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Ejecutar la petición
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Manejar errores
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . $error]);
    exit();
}

// Devolver la respuesta de Bold
http_response_code($httpCode);
echo $response;
?>