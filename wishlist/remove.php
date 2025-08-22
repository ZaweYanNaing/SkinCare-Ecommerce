<?php
// ✅ CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json");

// ✅ Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';

// ✅ Get raw input and decode JSON
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Check if JSON is valid
if (is_null($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit();
}

// ✅ Validate input
if (!isset($data['wishlistID'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing wishlistID"]);
    exit();
}

$wishlistId = (int)$data['wishlistID'];

// ✅ Prepare and execute SQL
$sql = "DELETE FROM WishList WHERE wishlistID = ?";
$stmt = $con->prepare($sql);

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to prepare SQL"]);
    exit();
}

$stmt->bind_param("i", $wishlistId);
$result = $stmt->execute();

if ($result) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>
