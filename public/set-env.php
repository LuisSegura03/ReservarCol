<?php
// set-env.php - Script para configurar variable de entorno en Hostinger
header('Content-Type: application/json');

// Intentar configurar la variable de entorno
putenv('BOLD_API_KEY=kpLzvafnrXJuRQxuGbe51_gp03AAMlxsAQQVa8oV8d8');

// Verificar si se configuró
$apiKey = getenv('BOLD_API_KEY');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'putenv_attempted' => true,
    'api_key_found_after_putenv' => $apiKey !== false && $apiKey !== '',
    'api_key_value' => $apiKey ? substr($apiKey, 0, 10) . '...' : null,
    'note' => 'putenv() solo afecta el proceso actual de PHP, no sesiones futuras'
];

echo json_encode($result, JSON_PRETTY_PRINT);
?>