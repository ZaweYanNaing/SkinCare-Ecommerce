<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include database connection
require_once 'db/database.php';

// Use the mysqli connection from database.php
if (!$con || $con->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . ($con ? $con->connect_error : 'Connection not established')]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        createOrder($con);
        break;
    case 'GET':
        if (isset($_GET['orderID'])) {
            getOrderDetails($con, $_GET['orderID']);
        } elseif (isset($_GET['customerID'])) {
            getCustomerOrders($con, $_GET['customerID']);
        } else {
            getAllOrders($con);
        }
        break;
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function createOrder($con)
{
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($input['customerID']) || !isset($input['items']) || !isset($input['payment'])) {
            echo json_encode(['error' => 'Missing required fields: customerID, items, payment']);
            return;
        }

        $customerID = $input['customerID'];
        $items = $input['items'];
        $paymentInfo = $input['payment'];
        $status = $input['status'] ?? 'pending';

        // Validate items array
        if (empty($items) || !is_array($items)) {
            echo json_encode(['error' => 'Items array is required and cannot be empty']);
            return;
        }

        // Validate payment info
        if (!isset($paymentInfo['amount']) || !isset($paymentInfo['tranID']) || !isset($paymentInfo['paymentMethod'])) {
            echo json_encode(['error' => 'Payment information incomplete']);
            return;
        }

        // Start transaction
        $con->autocommit(FALSE);

        // 1. Create Order
        $orderStmt = $con->prepare("INSERT INTO `Order`(customerID, status) VALUES (?, ?)");
        if (!$orderStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $orderStmt->bind_param("is", $customerID, $status);
        if (!$orderStmt->execute()) {
            throw new Exception("Execute failed: " . $orderStmt->error);
        }

        $orderID = $con->insert_id;
        $orderStmt->close();

        // 2. Create Payment record
        $paymentStmt = $con->prepare("INSERT INTO Payment (OrderID, Amount, tranID, PayDate, paymentMethod) VALUES (?, ?, ?, NOW(), ?)");
        if (!$paymentStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $paymentStmt->bind_param("idss", $orderID, $paymentInfo['amount'], $paymentInfo['tranID'], $paymentInfo['paymentMethod']);
        if (!$paymentStmt->execute()) {
            throw new Exception("Execute failed: " . $paymentStmt->error);
        }

        $paymentID = $con->insert_id;
        $paymentStmt->close();

        // 3. Create Order Items and update stock
        $orderItemStmt = $con->prepare("INSERT INTO OrderItem (ProductID, Quantity, OrderID, unitPrice) VALUES (?, ?, ?, ?)");
        if (!$orderItemStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $updateStockStmt = $con->prepare("UPDATE Product SET Stock = Stock - ? WHERE ProductID = ? AND Stock >= ?");
        if (!$updateStockStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $getProductStmt = $con->prepare("SELECT ProductID, Name, Price, Stock FROM Product WHERE ProductID = ?");
        if (!$getProductStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $totalCalculated = 0;
        $orderItemsCreated = [];

        foreach ($items as $item) {
            if (!isset($item['ProductID']) || !isset($item['quantity']) || !isset($item['Price'])) {
                throw new Exception('Invalid item data: ProductID, quantity, and Price are required');
            }

            $productID = $item['ProductID'];
            $quantity = $item['quantity'];
            $unitPrice = $item['Price'];

            // Verify product exists and has sufficient stock
            $getProductStmt->bind_param("i", $productID);
            if (!$getProductStmt->execute()) {
                throw new Exception("Execute failed: " . $getProductStmt->error);
            }

            $result = $getProductStmt->get_result();
            $product = $result->fetch_assoc();

            if (!$product) {
                throw new Exception("Product with ID $productID not found");
            }

            if ($product['Stock'] < $quantity) {
                throw new Exception("Insufficient stock for product: {$product['Name']}. Available: {$product['Stock']}, Requested: $quantity");
            }

            // Create order item
            $orderItemStmt->bind_param("iiid", $productID, $quantity, $orderID, $unitPrice);
            if (!$orderItemStmt->execute()) {
                throw new Exception("Execute failed: " . $orderItemStmt->error);
            }

            // Update stock
            $updateStockStmt->bind_param("iii", $quantity, $productID, $quantity);
            if (!$updateStockStmt->execute()) {
                throw new Exception("Execute failed: " . $updateStockStmt->error);
            }

            // Track for response
            $orderItemsCreated[] = [
                'ProductID' => $productID,
                'Name' => $product['Name'],
                'quantity' => $quantity,
                'unitPrice' => $unitPrice,
                'total' => $quantity * $unitPrice
            ];

            $totalCalculated += $quantity * $unitPrice;
        }

        $orderItemStmt->close();
        $updateStockStmt->close();
        $getProductStmt->close();

        // Calculate tax and shipping (same logic as frontend)
        $subtotal = $totalCalculated;
        $tax = round($subtotal * 0.05);
        $shipping = $subtotal > 50000 ? 0 : 3000;
        $finalTotal = $subtotal + $tax + $shipping;

        // Verify payment amount matches calculated total
        if (abs($paymentInfo['amount'] - $finalTotal) > 1) { // Allow 1 Ks difference for rounding
            throw new Exception("Payment amount mismatch. Expected: $finalTotal, Received: {$paymentInfo['amount']}");
        }

        // Commit transaction
        $con->commit();
        $con->autocommit(TRUE);

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => [
                'orderID' => $orderID,
                'paymentID' => $paymentID,
                'customerID' => $customerID,
                'status' => $status,
                'orderDate' => date('Y-m-d H:i:s'),
                'items' => $orderItemsCreated,
                'pricing' => [
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping' => $shipping,
                    'total' => $finalTotal
                ],
                'payment' => [
                    'amount' => $paymentInfo['amount'],
                    'tranID' => $paymentInfo['tranID'],
                    'paymentMethod' => $paymentInfo['paymentMethod']
                ]
            ]
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $con->rollback();
        $con->autocommit(TRUE);

        echo json_encode([
            'error' => 'Order creation failed: ' . $e->getMessage()
        ]);
    }
}

function getOrderDetails($con, $orderID)
{
    try {
        // Get order with payment info
        $orderStmt = $con->prepare("
            SELECT 
                o.OrderID,
                o.customerID,
                o.orderDate,
                o.status,
                p.PaymentID,
                p.Amount,
                p.tranID,
                p.PayDate,
                p.paymentMethod,
                u.name as customerName,
                u.email as customerEmail
            FROM orders o
            LEFT JOIN payment p ON o.OrderID = p.OrderID
            LEFT JOIN users u ON o.customerID = u.id
            WHERE o.OrderID = ?
        ");

        if (!$orderStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $orderStmt->bind_param("i", $orderID);
        if (!$orderStmt->execute()) {
            throw new Exception("Execute failed: " . $orderStmt->error);
        }

        $result = $orderStmt->get_result();
        $order = $result->fetch_assoc();
        $orderStmt->close();

        if (!$order) {
            echo json_encode(['error' => 'Order not found']);
            return;
        }

        // Get order items with product details
        $itemsStmt = $con->prepare("
            SELECT 
                oi.ID,
                oi.ProductID,
                oi.Quantity,
                oi.unitPrice,
                pr.Name,
                pr.Description,
                pr.Image,
                pr.ForSkinType,
                (oi.Quantity * oi.unitPrice) as itemTotal
            FROM orderitem oi
            JOIN products pr ON oi.ProductID = pr.ProductID
            WHERE oi.OrderID = ?
        ");

        if (!$itemsStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $itemsStmt->bind_param("i", $orderID);
        if (!$itemsStmt->execute()) {
            throw new Exception("Execute failed: " . $itemsStmt->error);
        }

        $result = $itemsStmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $itemsStmt->close();

        // Calculate totals
        $subtotal = array_sum(array_column($items, 'itemTotal'));
        $tax = round($subtotal * 0.05);
        $shipping = $subtotal > 50000 ? 0 : 3000;
        $total = $subtotal + $tax + $shipping;

        echo json_encode([
            'success' => true,
            'data' => [
                'order' => $order,
                'items' => $items,
                'pricing' => [
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping' => $shipping,
                    'total' => $total
                ]
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to get order details: ' . $e->getMessage()]);
    }
}

function getCustomerOrders($con, $customerID)
{
    try {
        $stmt = $con->prepare("
            SELECT 
                o.OrderID,
                o.orderDate,
                o.status,
                p.Amount,
                p.paymentMethod,
                COUNT(oi.ID) as itemCount
            FROM orders o
            LEFT JOIN payment p ON o.OrderID = p.OrderID
            LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
            WHERE o.customerID = ?
            GROUP BY o.OrderID
            ORDER BY o.orderDate DESC
        ");

        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $stmt->bind_param("i", $customerID);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $result = $stmt->get_result();
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'data' => $orders
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to get customer orders: ' . $e->getMessage()]);
    }
}

function getAllOrders($con)
{
    try {
        $stmt = $con->prepare("
            SELECT 
                o.OrderID,
                o.customerID,
                o.orderDate,
                o.status,
                p.Amount,
                p.paymentMethod,
                u.name as customerName,
                u.email as customerEmail,
                COUNT(oi.ID) as itemCount
            FROM orders o
            LEFT JOIN payment p ON o.OrderID = p.OrderID
            LEFT JOIN users u ON o.customerID = u.id
            LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
            GROUP BY o.OrderID
            ORDER BY o.orderDate DESC
            LIMIT 100
        ");

        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $result = $stmt->get_result();
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'data' => $orders
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to get orders: ' . $e->getMessage()]);
    }
}
