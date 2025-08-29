<?php
// Simple PHP development server starter
// Run this with: php -S localhost:8080 start-server.php

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Handle CORS for all requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Route requests to appropriate files
if (file_exists('.' . $path)) {
    return false; // Let PHP serve the file directly
}

// If file doesn't exist, return 404
http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>