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
$apiKey = getenv('BOLD_API_KEY') ?: 'tu_api_key_aqui'; // Configurar en variables de entorno

// Headers para Bold
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
];

// Inicializar cURL
$ch = curl_init($boldApiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
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