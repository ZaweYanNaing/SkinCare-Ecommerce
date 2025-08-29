<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== PROFILE DEBUG SCRIPT ===\n\n";

// Step 1: Test database connection
echo "1. Testing database connection...\n";
try {
    include 'config/database.php';
    echo "✅ Database connected successfully\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n\n";
    exit;
}

// Step 2: Check if Customer table exists and has data
echo "2. Checking Customer table...\n";
try {
    $stmt = $pdo->query("DESCRIBE Customer");
    $columns = $stmt->fetchAll();
    echo "✅ Customer table structure:\n";
    foreach ($columns as $col) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Customer");
    $result = $stmt->fetch();
    echo "✅ Total customers: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "❌ Error checking Customer table: " . $e->getMessage() . "\n\n";
}

// Step 3: Show sample customer data
echo "3. Sample customer data:\n";
try {
    $stmt = $pdo->query("SELECT CID, CName, CEmail, CPhone, Gender, SkinType FROM Customer LIMIT 3");
    $customers = $stmt->fetchAll();
    foreach ($customers as $customer) {
        echo "   ID: {$customer['CID']}, Name: {$customer['CName']}, Email: {$customer['CEmail']}\n";
        echo "   Phone: " . ($customer['CPhone'] ?: 'NULL') . ", Gender: " . ($customer['Gender'] !== null ? $customer['Gender'] : 'NULL') . ", SkinType: " . ($customer['SkinType'] ?: 'NULL') . "\n\n";
    }
} catch (Exception $e) {
    echo "❌ Error fetching customers: " . $e->getMessage() . "\n\n";
}

// Step 4: Test profile fetch for user ID 1
echo "4. Testing profile fetch for user ID 1...\n";
try {
    $stmt = $pdo->prepare("SELECT CID, CName, CPhone, Address, CEmail, Gender, SkinType FROM Customer WHERE CID = ?");
    $stmt->execute([1]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✅ User found:\n";
        echo json_encode($user, JSON_PRETTY_PRINT) . "\n\n";
    } else {
        echo "❌ No user found with ID 1\n\n";
    }
} catch (Exception $e) {
    echo "❌ Error fetching user: " . $e->getMessage() . "\n\n";
}

// Step 5: Test update functionality
echo "5. Testing update functionality...\n";
try {
    $testUserId = 1;
    $originalName = "Original Name";
    $testName = "Test Update " . date('H:i:s');
    
    // Get original data
    $stmt = $pdo->prepare("SELECT CName FROM Customer WHERE CID = ?");
    $stmt->execute([$testUserId]);
    $original = $stmt->fetch();
    
    if ($original) {
        $originalName = $original['CName'];
        echo "   Original name: $originalName\n";
        
        // Perform test update
        $stmt = $pdo->prepare("UPDATE Customer SET CName = ? WHERE CID = ?");
        $result = $stmt->execute([$testName, $testUserId]);
        $rowsAffected = $stmt->rowCount();
        
        echo "   Update result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        echo "   Rows affected: $rowsAffected\n";
        
        // Check if update worked
        $stmt = $pdo->prepare("SELECT CName FROM Customer WHERE CID = ?");
        $stmt->execute([$testUserId]);
        $updated = $stmt->fetch();
        
        if ($updated && $updated['CName'] === $testName) {
            echo "✅ Update successful! New name: " . $updated['CName'] . "\n";
            
            // Restore original name
            $stmt = $pdo->prepare("UPDATE Customer SET CName = ? WHERE CID = ?");
            $stmt->execute([$originalName, $testUserId]);
            echo "   Restored original name\n\n";
        } else {
            echo "❌ Update failed - name not changed\n\n";
        }
    } else {
        echo "❌ Cannot test update - user ID 1 not found\n\n";
    }
} catch (Exception $e) {
    echo "❌ Error testing update: " . $e->getMessage() . "\n\n";
}

// Step 6: Test the actual API endpoint
echo "6. Testing API endpoint simulation...\n";
try {
    // Simulate the exact same request that frontend makes
    $testData = [
        'CID' => 1,
        'CName' => 'API Test User',
        'CPhone' => '09999999999',
        'Address' => 'API Test Address',
        'Gender' => 1,
        'SkinType' => 'Combination'
    ];
    
    echo "   Test data: " . json_encode($testData) . "\n";
    
    // Check if user exists
    $checkStmt = $pdo->prepare("SELECT CID FROM Customer WHERE CID = ?");
    $checkStmt->execute([$testData['CID']]);
    $userExists = $checkStmt->fetch();
    
    if (!$userExists) {
        echo "❌ User not found with ID: " . $testData['CID'] . "\n\n";
    } else {
        echo "✅ User exists\n";
        
        // Perform update
        $stmt = $pdo->prepare("
            UPDATE Customer 
            SET CName = ?, CPhone = ?, Address = ?, Gender = ?, SkinType = ? 
            WHERE CID = ?
        ");
        
        $result = $stmt->execute([
            $testData['CName'],
            $testData['CPhone'],
            $testData['Address'],
            $testData['Gender'],
            $testData['SkinType'],
            $testData['CID']
        ]);
        
        $rowsAffected = $stmt->rowCount();
        
        echo "   API simulation result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        echo "   Rows affected: $rowsAffected\n";
        
        if ($result && $rowsAffected > 0) {
            echo "✅ API simulation successful!\n\n";
        } else {
            echo "❌ API simulation failed - no rows affected\n\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error in API simulation: " . $e->getMessage() . "\n\n";
}

// Step 7: Check Docker environment
echo "7. Docker environment check...\n";
echo "   PHP Version: " . phpversion() . "\n";
echo "   PDO MySQL available: " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
echo "   Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "   Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "\n\n";

echo "=== DEBUG COMPLETE ===\n";
echo "If all tests pass but profile still doesn't save, check:\n";
echo "1. Browser console for JavaScript errors\n";
echo "2. Network tab to see actual API requests\n";
echo "3. Docker logs: docker-compose logs www\n";
echo "4. Make sure user is logged in with correct ID\n";
?>