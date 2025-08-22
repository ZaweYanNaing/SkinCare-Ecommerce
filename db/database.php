<?php

// Try to connect using Docker service name first, then fallback to localhost
$dbHost = 'db'; // Docker service name
$dbUser = 'php_docker';
$dbPass = 'password';
$dbName = 'skincare_db';

// First try Docker container name
$con = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// If connection fails, try localhost
if ($con->connect_error) {
    $dbHost = 'localhost';
    $con = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    
    // If still failing, return error
    if ($con->connect_error) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "Database connection error: " . $con->connect_error]);
        exit();
    }
}


