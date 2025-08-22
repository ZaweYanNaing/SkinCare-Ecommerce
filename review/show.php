<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get product ID from query string
    $productId = isset($_GET['pid']) ? intval($_GET['pid']) : 0;

    if ($productId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid product ID."
        ]);
        exit();
    }

    // Prepare SQL query
    $sql = "SELECT Review.ReviewID,
                   Customer.CName,
                   Review.Date,
                   Review.Rating,
                   Review.Comment,
                   Review.BeforeImg,
                   Review.AfterImg
            FROM Review
            JOIN Customer ON Review.CID = Customer.CID
            WHERE Review.productID = ?";

    $stmt = $con->prepare($sql);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $reviews
    ]);

    $stmt->close();
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
}

$con->close();
?>
