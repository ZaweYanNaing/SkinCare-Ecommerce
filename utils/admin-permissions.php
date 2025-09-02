<?php
/**
 * Admin Role-Based Permission System
 * Defines permissions for different admin roles and provides checking functions
 */

/**
 * Define role permissions
 * Each role has specific permissions for different modules
 */
function getAdminPermissions() {
    return [
        'Super Admin' => [
            'admin_management' => ['create', 'read', 'update', 'delete'],
            'account_management' => ['create', 'read', 'update', 'delete'],
            'product_management' => ['create', 'read', 'update', 'delete'],
            'order_management' => ['create', 'read', 'update', 'delete'],
            'customer_management' => ['create', 'read', 'update', 'delete'],
            'reports' => ['read', 'export'],
            'notifications' => ['create', 'read', 'update', 'delete'],
            'overview' => ['read'],
            'transactions' => ['read', 'update']
        ],
        'Manager' => [
            'admin_management' => [], // Cannot create new admins
            'account_management' => ['read', 'update'],
            'product_management' => ['create', 'read', 'update', 'delete'],
            'order_management' => ['create', 'read', 'update', 'delete'],
            'customer_management' => ['read', 'update'],
            'reports' => ['read', 'export'],
            'notifications' => ['create', 'read', 'update', 'delete'],
            'overview' => ['read'],
            'transactions' => ['read', 'update']
        ],
        'Staff' => [
            'admin_management' => [], // No admin management
            'account_management' => [], // No account management
            'product_management' => [], // No product management
            'order_management' => ['read', 'update'],
            'customer_management' => ['read'],
            'reports' => ['read'],
            'notifications' => ['read'],
            'overview' => ['read'],
            'transactions' => ['read']
        ],
        'Expert' => [
            'admin_management' => [], // No admin management
            'account_management' => ['read'],
            'product_management' => ['read', 'update'], // Can update products but not create/delete
            'order_management' => ['read', 'update'],
            'customer_management' => ['read', 'update'],
            'reports' => ['read', 'export'],
            'notifications' => ['create', 'read', 'update'],
            'overview' => ['read'],
            'transactions' => ['read']
        ]
    ];
}

/**
 * Check if an admin has permission for a specific action
 * @param string $adminRole Admin's role
 * @param string $module Module name (e.g., 'product_management')
 * @param string $action Action name (e.g., 'create', 'read', 'update', 'delete')
 * @return bool Whether the admin has permission
 */
function hasPermission($adminRole, $module, $action) {
    $permissions = getAdminPermissions();
    
    if (!isset($permissions[$adminRole])) {
        return false;
    }
    
    if (!isset($permissions[$adminRole][$module])) {
        return false;
    }
    
    return in_array($action, $permissions[$adminRole][$module]);
}

/**
 * Get all permissions for a specific admin role
 * @param string $adminRole Admin's role
 * @return array All permissions for the role
 */
function getRolePermissions($adminRole) {
    $permissions = getAdminPermissions();
    return $permissions[$adminRole] ?? [];
}

/**
 * Check admin authentication and permissions
 * @param mysqli|PDO $connection Database connection
 * @param int $adminId Admin ID
 * @param string $module Module being accessed
 * @param string $action Action being performed
 * @return array Result with permission status and admin info
 */
function checkAdminPermission($connection, $adminId, $module, $action) {
    try {
        // Get admin info from database
        if ($connection instanceof PDO) {
            $stmt = $connection->prepare("SELECT AdminID, Type, Email FROM Admin WHERE AdminID = ?");
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // MySQLi connection
            $stmt = $connection->prepare("SELECT AdminID, Type, Email FROM Admin WHERE AdminID = ?");
            $stmt->bind_param("i", $adminId);
            $stmt->execute();
            $result = $stmt->get_result();
            $admin = $result->fetch_assoc();
            $stmt->close();
        }
        
        if (!$admin) {
            return [
                'allowed' => false,
                'message' => 'Admin not found',
                'error_code' => 'ADMIN_NOT_FOUND'
            ];
        }
        
        $hasAccess = hasPermission($admin['Type'], $module, $action);
        
        return [
            'allowed' => $hasAccess,
            'message' => $hasAccess ? 'Permission granted' : 'Access denied: Insufficient permissions',
            'error_code' => $hasAccess ? null : 'INSUFFICIENT_PERMISSIONS',
            'admin' => $admin,
            'role' => $admin['Type']
        ];
        
    } catch (Exception $e) {
        return [
            'allowed' => false,
            'message' => 'Error checking permissions: ' . $e->getMessage(),
            'error_code' => 'SYSTEM_ERROR'
        ];
    }
}

/**
 * Get role description for display purposes
 * @param string $role Admin role
 * @return string Role description
 */
function getRoleDescription($role) {
    $descriptions = [
        'Super Admin' => 'Full system access - can manage all aspects including admin accounts',
        'Manager' => 'Management access - can handle products, orders, and customers but cannot create new admins',
        'Staff' => 'Limited access - can view orders, customers, and reports but cannot manage accounts or products',
        'Expert' => 'Specialized access - can update products and manage customers with reporting capabilities'
    ];
    
    return $descriptions[$role] ?? 'Unknown role';
}

/**
 * Get available admin roles
 * @return array List of available roles
 */
function getAvailableRoles() {
    return ['Super Admin', 'Manager', 'Staff', 'Expert'];
}

/**
 * Middleware function to protect API endpoints
 * @param mysqli|PDO $connection Database connection
 * @param int $adminId Admin ID from session/token
 * @param string $module Module being accessed
 * @param string $action Action being performed
 * @return bool|array Returns true if allowed, or error array if not
 */
function requirePermission($connection, $adminId, $module, $action) {
    $check = checkAdminPermission($connection, $adminId, $module, $action);
    
    if (!$check['allowed']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => $check['message'],
            'error_code' => $check['error_code']
        ]);
        exit;
    }
    
    return true;
}
?>