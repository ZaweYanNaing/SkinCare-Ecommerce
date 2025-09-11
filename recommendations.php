<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include './config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? null;
    
    try {
        if ($userId) {
            // Get personalized recommendations for logged-in user
            $recommendations = getPersonalizedRecommendations($pdo, $userId);
        } else {
            // Get general recommendations for non-logged-in users
            $recommendations = getGeneralRecommendations($pdo);
        }
        
        echo json_encode([
            'success' => true,
            'data' => $recommendations,
            'type' => $userId ? 'personalized' : 'general'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching recommendations: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function getPersonalizedRecommendations($pdo, $userId) {
    // Get customer's skin type
    $customerStmt = $pdo->prepare("SELECT SkinType FROM Customer WHERE CID = ?");
    $customerStmt->execute([$userId]);
    $customer = $customerStmt->fetch();
    
    if (!$customer) {
        return getGeneralRecommendations($pdo);
    }
    
    $skinType = $customer['SkinType'];
    
    // Get customer's order history to find purchased categories
    $orderHistoryStmt = $pdo->prepare("
        SELECT DISTINCT p.CategoryID, c.CategoryName, COUNT(*) as purchase_count
        FROM OrderItem oi
        JOIN `Order` o ON oi.OrderID = o.OrderID
        JOIN Product p ON oi.ProductID = p.ProductID
        JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE o.customerID = ? AND o.status = 'confirmed'
        GROUP BY p.CategoryID, c.CategoryName
        ORDER BY purchase_count DESC
    ");
    $orderHistoryStmt->execute([$userId]);
    $purchaseHistory = $orderHistoryStmt->fetchAll();
    
    // Get products customer hasn't purchased yet, prioritizing their skin type
    $recommendationStmt = $pdo->prepare("
        SELECT DISTINCT 
            p.ProductID,
            p.Name,
            p.Description,
            p.Price,
            p.Stock,
            p.ForSkinType,
            p.Image,
            c.CategoryName,
            CASE 
                WHEN p.ForSkinType = ? THEN 3
                WHEN p.ForSkinType = 'Combination' THEN 2
                ELSE 1
            END as skin_type_priority,
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
        WHERE p.ProductID NOT IN (
            SELECT DISTINCT oi.ProductID
            FROM OrderItem oi
            JOIN `Order` o ON oi.OrderID = o.OrderID
            WHERE o.customerID = ? AND o.status = 'confirmed'
        )
        AND p.Stock > 0
        ORDER BY 
            skin_type_priority DESC,
            average_rating DESC,
            review_count DESC,
            p.ProductID DESC
        LIMIT 8
    ");
    $recommendationStmt->execute([$skinType, $userId]);
    $recommendations = $recommendationStmt->fetchAll();
    
    // Add recommendation reasons
    foreach ($recommendations as &$product) {
        $reasons = [];
        
        if ($product['ForSkinType'] === $skinType) {
            $reasons[] = "Perfect for your {$skinType} skin type";
        } elseif ($product['ForSkinType'] === 'Combination') {
            $reasons[] = "Suitable for all skin types including {$skinType}";
        }
        
        if ($product['average_rating'] >= 4) {
            $reasons[] = "Highly rated (" . number_format($product['average_rating'], 1) . "/5)";
        }
        
        if ($product['review_count'] > 5) {
            $reasons[] = "Popular choice ({$product['review_count']} reviews)";
        }
        
        // Check if it's from a category they frequently buy
        foreach ($purchaseHistory as $category) {
            if ($category['CategoryID'] == $product['CategoryID'] && $category['purchase_count'] >= 2) {
                $reasons[] = "You often buy {$category['CategoryName']} products";
                break;
            }
        }
        
        $product['recommendation_reason'] = implode(' • ', $reasons);
        $product['Price'] = (float)$product['Price'];
        $product['Stock'] = (int)$product['Stock'];
    }
    
    return $recommendations;
}

function getGeneralRecommendations($pdo) {
    // Get popular products based on ratings and reviews for non-logged-in users
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
            COALESCE(review_count.review_count, 0) as review_count,
            COALESCE(order_count.order_count, 0) as order_count
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
        LEFT JOIN (
            SELECT ProductID, COUNT(*) as order_count
            FROM OrderItem oi
            JOIN `Order` o ON oi.OrderID = o.OrderID
            WHERE o.status = 'confirmed'
            GROUP BY ProductID
        ) order_count ON p.ProductID = order_count.ProductID
        WHERE p.Stock > 0
        ORDER BY 
            (COALESCE(avg_rating.avg_rating, 0) * 0.4 + 
             COALESCE(order_count.order_count, 0) * 0.3 + 
             COALESCE(review_count.review_count, 0) * 0.3) DESC,
            p.ProductID DESC
        LIMIT 8
    ");
    $stmt->execute();
    $recommendations = $stmt->fetchAll();
    
    // Add general recommendation reasons
    foreach ($recommendations as &$product) {
        $reasons = [];
        
        if ($product['average_rating'] >= 4) {
            $reasons[] = "Highly rated (" . number_format($product['average_rating'], 1) . "/5)";
        }
        
        if ($product['order_count'] >= 5) {
            $reasons[] = "Bestseller";
        }
        
        if ($product['review_count'] > 3) {
            $reasons[] = "Popular choice";
        }
        
        if (empty($reasons)) {
            $reasons[] = "Recommended for you";
        }
        
        $product['recommendation_reason'] = implode(' • ', $reasons);
        $product['Price'] = (float)$product['Price'];
        $product['Stock'] = (int)$product['Stock'];
    }
    
    return $recommendations;
}
?>
