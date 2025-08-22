-- Create Database
CREATE DATABASE IF NOT EXISTS skincare_db;
USE skincare_db;

-- Customer Table
CREATE TABLE Customer (
    CID INT AUTO_INCREMENT PRIMARY KEY,
    CName VARCHAR(100),
    CPhone VARCHAR(15),
    Address TEXT,
    CEmail VARCHAR(100) UNIQUE,
    CPass VARCHAR(100),
    Gender BOOLEAN,
    SkinType VARCHAR(50)
);

-- Product Table
CREATE TABLE Product (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Description TEXT,
    Price DOUBLE,
    Stock INT,
    ForSkinType VARCHAR(50)
);

-- Review Table
CREATE TABLE Review (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    BeforeImg VARCHAR(255),
    AfterImg VARCHAR(255),
    Comment TEXT,
    CID INT,
    Rating INT,
    FOREIGN KEY (CID) REFERENCES Customer(CID)
);

-- WishList Table
CREATE TABLE WishList (
    wishlistID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CID)
);

-- WishListItem Table
CREATE TABLE WishListItem (
    WItemID INT AUTO_INCREMENT PRIMARY KEY,
    wishlistID INT,
    productID INT,
    FOREIGN KEY (wishlistID) REFERENCES WishList(wishlistID),
    FOREIGN KEY (productID) REFERENCES Product(ProductID)
);

-- Order Table
CREATE TABLE `Order` (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT,
    orderDate DATE,
    status VARCHAR(50),
    FOREIGN KEY (customerID) REFERENCES Customer(CID)
);

-- OrderItem Table
CREATE TABLE OrderItem (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT,
    Quantity INT,
    Price DOUBLE,
    OrderID INT,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);

-- Payment Table
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT,
    Amount DOUBLE,
    PayDate DATE,
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);

-- CashOnDeli Table
CREATE TABLE CashOnDeli (
    CalID INT PRIMARY KEY,
    FOREIGN KEY (CalID) REFERENCES Payment(PaymentID)
);

-- Kpay Table
CREATE TABLE Kpay (
    PaymentID INT PRIMARY KEY,
    TrcID VARCHAR(100),
    TrcImg VARCHAR(255),
    FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID)
);

-- Bank Payment Table
CREATE TABLE BankPayment (
    PaymentID INT PRIMARY KEY,
    BankTrcID VARCHAR(100),
    FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID)
);

-- Admin Table
CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Type VARCHAR(50),
    Email VARCHAR(100),
    Password VARCHAR(100)
);

-- Notification Table
CREATE TABLE Notification (
    NotiID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    Message TEXT,
    DateSent DATE,
    isRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CID)
);
