<?php
// create-env.php - Script para crear archivo .env en Hostinger
$envContent = "BOLD_API_KEY=kpLzvafnrXJuRQxuGbe51_gp03AAMlxsAQQVa8oV8d8\n";
$envFile = __DIR__ . '/.env';

if (file_put_contents($envFile, $envContent) !== false) {
    echo json_encode([
        'success' => true,
        'message' => '.env file created successfully',
        'file' => $envFile,
        'permissions' => substr(sprintf('%o', fileperms($envFile)), -4)
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create .env file',
        'directory_writable' => is_writable(__DIR__)
    ]);
}
?>