<?php
// test-env.php - Script para probar la lectura de variables de entorno en Hostinger
header('Content-Type: application/json');

function getEnvValue(string $name): ?string {
    // Intentar múltiples fuentes para variables de entorno en hosting compartido
    if (isset($_ENV[$name]) && $_ENV[$name] !== '') {
        return $_ENV[$name];
    }
    if (isset($_SERVER[$name]) && $_SERVER[$name] !== '') {
        return $_SERVER[$name];
    }
    $value = getenv($name);
    if ($value !== false && $value !== '') {
        return $value;
    }

    // En algunos hosting, las variables están en archivos .env
    $envFiles = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        __DIR__ . '/public/.env',
        __DIR__ . '/../../.env'
    ];

    foreach ($envFiles as $envFile) {
        if (!file_exists($envFile)) {
            continue;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ($key === $name && $val !== '') {
                return $val;
            }
        }
    }

    return null;
}

$apiKey = getEnvValue('BOLD_API_KEY');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'api_key_found' => $apiKey !== null,
    'api_key_length' => $apiKey ? strlen($apiKey) : 0,
    'api_key_prefix' => $apiKey ? substr($apiKey, 0, 10) . '...' : null,
    'sources_checked' => [
        '_ENV' => isset($_ENV['BOLD_API_KEY']),
        '_SERVER' => isset($_SERVER['BOLD_API_KEY']),
        'getenv' => getenv('BOLD_API_KEY') !== false,
        '.env_file' => file_exists(__DIR__ . '/.env'),
        'parent_env_file' => file_exists(__DIR__ . '/../.env')
    ],
    'env_values' => [
        '_ENV_BOLD_API_KEY' => isset($_ENV['BOLD_API_KEY']) ? 'SET' : 'NOT_SET',
        '_SERVER_BOLD_API_KEY' => isset($_SERVER['BOLD_API_KEY']) ? 'SET' : 'NOT_SET',
        'getenv_BOLD_API_KEY' => getenv('BOLD_API_KEY') ? 'SET' : 'NOT_SET'
    ],
    'all_env_vars' => array_keys(array_merge($_ENV, $_SERVER))
];

echo json_encode($result, JSON_PRETTY_PRINT);
?>