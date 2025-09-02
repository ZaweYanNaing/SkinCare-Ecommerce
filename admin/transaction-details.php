<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }
    
    $orderId = isset($_GET['orderId']) ? (int)$_GET['orderId'] : 0;
    
    if (!$orderId) {
        echo json_encode(['success' => false, 'message' => 'Order ID is required']);
        exit;
    }
    
    // Get order details
    $orderQuery = "
        SELECT 
            o.OrderID,
            o.orderDate,
            o.status,
            c.CID as customerID,
            c.CName as customerName,
            c.CEmail as customerEmail,
            c.CPhone as customerPhone,
            c.Address as customerAddress,
            c.SkinType as customerSkinType,
            p.PaymentID,
            p.Amount as totalAmount,
            p.paymentMethod,
            p.PayDate,
            p.tranID
        FROM `Order` o
        LEFT JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        WHERE o.OrderID = ?
    ";
    
    $orderStmt = $pdo->prepare($orderQuery);
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    // Get order items
    $itemsQuery = "
        SELECT 
            oi.ID,
            oi.Quantity,
            oi.unitPrice,
            (oi.Quantity * oi.unitPrice) as subtotal,
            pr.ProductID,
            pr.Name as productName,
            pr.Description as productDescription,
            pr.Image as productImage,
            pr.ForSkinType,
            cat.CategoryName
        FROM OrderItem oi
        LEFT JOIN Product pr ON oi.ProductID = pr.ProductID
        LEFT JOIN Categories cat ON pr.CategoryID = cat.CategoryID
        WHERE oi.OrderID = ?
        ORDER BY oi.ID
    ";
    
    $itemsStmt = $pdo->prepare($itemsQuery);
    $itemsStmt->execute([$orderId]);
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate totals
    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += $item['subtotal'];
    }
    
    $taxRate = 0.05; // 5% tax
    $tax = $subtotal * $taxRate;
    $shippingFee = 5000; // Fixed shipping fee
    $total = $subtotal + $tax + $shippingFee;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'order' => $order,
            'items' => $items,
            'summary' => [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'taxRate' => $taxRate,
                'shippingFee' => $shippingFee,
                'total' => $total,
                'itemCount' => count($items)
            ]
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>