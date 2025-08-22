<?php
// CORS headers - more comprehensive
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return 200 OK for preflight requests
    http_response_code(200);
    exit();
}

// Debug information
if (isset($_GET['debug'])) {
    echo json_encode([
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'post_data' => $_POST,
        'raw_input' => file_get_contents('php://input')
    ]);
    exit();
}

include './db/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if the request is JSON
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Handle JSON input
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $email = isset($data['Email']) ? trim($data['Email']) : null;
        $password = isset($data['Password']) ? trim($data['Password']) : null;
    } else {
        // Handle form data
        $email = isset($_POST['Email']) ? trim($_POST['Email']) : null;
        $password = isset($_POST['Password']) ? trim($_POST['Password']) : null;
    }

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Email and password are required."]);
        exit();
    }

    // Check if user exists and password matches
    $stmt = $con->prepare("SELECT * FROM Customer WHERE CEmail = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        $stmt->close();
        $con->close();
        exit();
    }

    $user = $result->fetch_assoc();
    
    // In a real application, you would use password_verify() to check hashed passwords
    // For this example, we're doing a direct comparison
    if (md5($password) !== $user['CPass']) {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        $stmt->close();
        $con->close();
        exit();
    }

    // Authentication successful
    echo json_encode([
        "success" => true, 
        "message" => "Login successful.",
        "user" => [
            "id" => $user['CID'],
            "email" => $user['CEmail']
            // Don't include password in the response
        ]
    ]);

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}

$con->close();
?>