<?php
// proxy.php - Bold API Proxy para Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Diagnóstico: permitir GET para confirmar que el proxy está accesible
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['status' => 'proxy alive']);
    exit();
}

// Solo permitir POST para crear links
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Obtener el payload del request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit();
}

// Configuración de Bold API
$boldApiUrl = 'https://integrations.api.bold.co/online/link/v1';

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
    $envFiles = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        __DIR__ . '/public/.env'
    ];

    foreach ($envFiles as $envFile) {
        if (!file_exists($envFile)) {
            continue;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ($key === $name && $val !== '') {
                error_log("Found $name in $envFile");
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
    'Content-Type: application/json',
    'Authorization: x-api-key ' . $apiKey
];

// Inicializar cURL
$ch = curl_init($boldApiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Debug: Log de la petición
error_log('Bold API Request: ' . $boldApiUrl);
error_log('Headers: ' . json_encode($headers));
error_log('Payload: ' . json_encode($data));

// Ejecutar la petición
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

// Debug: Log de la respuesta
error_log('HTTP Code: ' . $httpCode);
error_log('cURL Error: ' . $error);
error_log('Response: ' . substr($response, 0, 500));

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