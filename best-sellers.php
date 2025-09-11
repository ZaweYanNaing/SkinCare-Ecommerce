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
        // Get best-selling products based on order quantity and frequency
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
                COALESCE(SUM(oi.Quantity), 0) as total_sold,
                COALESCE(COUNT(DISTINCT oi.OrderID), 0) as order_count,
                COALESCE(avg_rating.avg_rating, 0) as average_rating,
                COALESCE(review_count.review_count, 0) as review_count
            FROM Product p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN OrderItem oi ON p.ProductID = oi.ProductID
            LEFT JOIN `Order` o ON oi.OrderID = o.OrderID AND o.status = 'confirmed'
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
            GROUP BY p.ProductID, p.Name, p.Description, p.Price, p.Stock, p.ForSkinType, p.Image, c.CategoryName, avg_rating.avg_rating, review_count.review_count
            HAVING total_sold > 0
            ORDER BY total_sold DESC, order_count DESC, average_rating DESC
            LIMIT 8
        ");
        $stmt->execute();
        $bestSellers = $stmt->fetchAll();
        
        // Format the data
        foreach ($bestSellers as &$product) {
            $product['Price'] = (float)$product['Price'];
            $product['Stock'] = (int)$product['Stock'];
            $product['total_sold'] = (int)$product['total_sold'];
            $product['order_count'] = (int)$product['order_count'];
            $product['average_rating'] = (float)$product['average_rating'];
            $product['review_count'] = (int)$product['review_count'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $bestSellers
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching best sellers: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
