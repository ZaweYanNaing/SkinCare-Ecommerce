# Skincare Backend Setup

## Quick Start

### Option 1: Using PHP Built-in Server (Recommended for Development)

1. **Start the PHP server:**
   ```bash
   php -S localhost:8080 start-server.php
   ```

2. **Import the database:**
   - Create a MySQL database named `skincare_db`
   - Import the `skincare_db.sql` file into your database
   - Update database credentials in `config/database.php` if needed

3. **Test the API:**
   - Open your browser and go to: `http://localhost:8080/user/profile.php?id=1`
   - You should see a JSON response

### Option 2: Using XAMPP/WAMP/MAMP

1. **Copy files to web server:**
   - Copy all PHP files to your `htdocs` folder (XAMPP) or `www` folder (WAMP)
   - Make sure the folder structure is maintained

2. **Start Apache and MySQL:**
   - Start Apache and MySQL from your control panel
   - Import the database as described above

3. **Access via:**
   - `http://localhost/user/profile.php?id=1`

### Option 3: Using Docker (if docker-compose.yml exists)

1. **Start with Docker:**
   ```bash
   docker-compose up -d
   ```

## API Endpoints

### User Management
- `GET /user/profile.php?id={userId}` - Get user profile
- `POST /user/update-profile.php` - Update user profile

### Orders
- `GET /order/user-orders.php?userId={userId}` - Get user orders

### Wishlist
- `POST /wishlist/add.php` - Add item to wishlist

## Database Configuration

Update `config/database.php` with your database credentials:

```php
$host = 'localhost';
$dbname = 'skincare_db';
$username = 'your_username';
$password = 'your_password';
```

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Make sure CORS headers are set in all PHP files
   - Check browser console for specific CORS errors

2. **Database Connection Failed:**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database `skincare_db` exists

3. **404 Errors:**
   - Check file paths are correct
   - Ensure web server is running
   - Verify file permissions

4. **JSON Parse Errors:**
   - Check PHP error logs
   - Ensure no PHP warnings/notices are output before JSON
   - Verify database connection is working

### Testing Backend Without Frontend:

You can test the API endpoints directly:

```bash
# Test user profile
curl "http://localhost:8080/user/profile.php?id=1"

# Test update profile
curl -X POST "http://localhost:8080/user/update-profile.php" \
  -H "Content-Type: application/json" \
  -d '{"CID":1,"CName":"Test User","CPhone":"123456789"}'
```

## Frontend Configuration

The frontend will automatically try multiple backend URLs:
- `http://localhost:8080` (PHP built-in server)
- `http://localhost` (Apache/Nginx)
- `http://localhost:3001` (Alternative port)

If no backend is available, it will use mock data for development.