-- Database schema for Skincare Store Order Management System

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS skincare_db;
USE skincare_db;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT NOT NULL,
    orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    INDEX idx_customer (customerID),
    INDEX idx_order_date (orderDate),
    INDEX idx_status (status)
);

-- Payment table
CREATE TABLE IF NOT EXISTS payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    tranID VARCHAR(50) NOT NULL,
    PayDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paymentMethod VARCHAR(50) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_tran_id (tranID),
    INDEX idx_pay_date (PayDate)
);

-- OrderItem table
CREATE TABLE IF NOT EXISTS orderitem (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    OrderID INT NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_product (ProductID)
);

-- Add some sample data for testing (optional)
-- Note: Make sure users and products tables exist first

-- Sample orders (uncomment if you want test data)
/*
INSERT INTO orders (customerID, orderDate, status) VALUES
(1, '2024-01-15 10:30:00', 'delivered'),
(2, '2024-01-16 14:20:00', 'shipped'),
(1, '2024-01-17 09:15:00', 'confirmed');

INSERT INTO payment (OrderID, Amount, tranID, PayDate, paymentMethod) VALUES
(1, 25500.00, '123456', '2024-01-15 10:35:00', 'KPay'),
(2, 18750.00, '789012', '2024-01-16 14:25:00', 'AyaPay'),
(3, 32100.00, '345678', '2024-01-17 09:20:00', 'KBZ bank');

INSERT INTO orderitem (ProductID, Quantity, OrderID, unitPrice) VALUES
(1, 2, 1, 12000.00),
(3, 1, 1, 8500.00),
(2, 1, 2, 15000.00),
(4, 3, 3, 9500.00),
(1, 1, 3, 12000.00);
*/

-- Create indexes for better performance
CREATE INDEX idx_orders_customer_date ON orders(customerID, orderDate DESC);
CREATE INDEX idx_payment_order_date ON payment(OrderID, PayDate DESC);
CREATE INDEX idx_orderitem_order_product ON orderitem(OrderID, ProductID);

-- Add constraints to ensure data integrity
ALTER TABLE orderitem ADD CONSTRAINT chk_quantity CHECK (Quantity > 0);
ALTER TABLE orderitem ADD CONSTRAINT chk_unit_price CHECK (unitPrice > 0);
ALTER TABLE payment ADD CONSTRAINT chk_amount CHECK (Amount > 0);

-- View for order summary (useful for reporting)
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.OrderID,
    o.customerID,
    u.name as customerName,
    u.email as customerEmail,
    o.orderDate,
    o.status,
    p.Amount as totalAmount,
    p.paymentMethod,
    p.tranID,
    COUNT(oi.ID) as itemCount,
    SUM(oi.Quantity) as totalQuantity
FROM orders o
LEFT JOIN users u ON o.customerID = u.id
LEFT JOIN payment p ON o.OrderID = p.OrderID
LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
GROUP BY o.OrderID, o.customerID, o.orderDate, o.status, p.PaymentID;

-- View for detailed order items
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.OrderID,
    o.customerID,
    o.orderDate,
    o.status,
    oi.ProductID,
    pr.Name as productName,
    pr.Image as productImage,
    oi.Quantity,
    oi.unitPrice,
    (oi.Quantity * oi.unitPrice) as itemTotal,
    p.Amount as orderTotal,
    p.paymentMethod,
    p.tranID
FROM orders o
JOIN orderitem oi ON o.OrderID = oi.OrderID
JOIN products pr ON oi.ProductID = pr.ProductID
LEFT JOIN payment p ON o.OrderID = p.OrderID;

-- Trigger to update product stock when order is cancelled
DELIMITER //
CREATE TRIGGER restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        UPDATE products p
        JOIN orderitem oi ON p.ProductID = oi.ProductID
        SET p.Stock = p.Stock + oi.Quantity
        WHERE oi.OrderID = NEW.OrderID;
    END IF;
END//
DELIMITER ;

-- Show table structure
DESCRIBE orders;
DESCRIBE payment;
DESCRIBE orderitem;