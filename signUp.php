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
        $password = isset($data['Password']) ? md5(trim($data['Password'])) : null;
    } else {
        // Handle form data
        $email = isset($_POST['Email']) ? trim($_POST['Email']) : null;
        $password = isset($_POST['Password']) ? md5(trim($_POST['Password'])) : null;
    }

  

    // Check if email already exists
    $checkStmt = $con->prepare("SELECT * FROM Customer WHERE CEmail = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists."]);
        $checkStmt->close();
        $con->close();
        exit();
    }
    $checkStmt->close();

    // Insert new user
    $name = substr($email, 0, 4);
    $insertStmt = $con->prepare("INSERT INTO Customer (CName, CEmail, CPass) VALUES (?, ?, ?)");
    $insertStmt->bind_param("sss", $name, $email, $password); // You can hash password if needed

    if ($insertStmt->execute()) {
        echo json_encode(["success" => true, "message" => "User registered successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to register user."]);
    }

    $insertStmt->close();
    $con->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    $con->close();
}
?>
