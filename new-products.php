<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include './config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get newest products (assuming newer ProductID means newer product)
        // In a real scenario, you'd have a CreatedDate field
        $stmt = $pdo->prepare("
            SELECT 
                p.ProductID,
                p.Name,
                p.Description,
                p.Price,
                p.Stock,
                p.ForSkinType,
                p.Image,
                c.CategoryName,
                COALESCE(avg_rating.avg_rating, 0) as average_rating,
                COALESCE(review_count.review_count, 0) as review_count
            FROM Product p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN (
                SELECT productID, AVG(Rating) as avg_rating
                FROM Review
                GROUP BY productID
            ) avg_rating ON p.ProductID = avg_rating.productID
            LEFT JOIN (
                SELECT productID, COUNT(*) as review_count
                FROM Review
                GROUP BY productID
            ) review_count ON p.ProductID = review_count.productID
            WHERE p.Stock > 0
            ORDER BY p.ProductID DESC
            LIMIT 8
        ");
        $stmt->execute();
        $newProducts = $stmt->fetchAll();
        
        // Format the data
        foreach ($newProducts as &$product) {
            $product['Price'] = (float)$product['Price'];
            $product['Stock'] = (int)$product['Stock'];
            $product['average_rating'] = (float)$product['average_rating'];
            $product['review_count'] = (int)$product['review_count'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $newProducts
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching new products: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
