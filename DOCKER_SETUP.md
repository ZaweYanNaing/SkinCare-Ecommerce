# Skincare Backend - Docker Setup

## Quick Start with Docker

### 1. Start Docker Services

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps
```

You should see:
- `www` service running on port 80 (Apache/PHP)
- `db` service running (MySQL)
- `phpmyadmin` service running on port 8001

### 2. Import Database

#### Option A: Using phpMyAdmin (Recommended)
1. Open http://localhost:8001 in your browser
2. Login with:
   - Server: `db`
   - Username: `php_docker`
   - Password: `password`
3. Create database `skincare_db` if it doesn't exist
4. Import the `skincare_db.sql` file

#### Option B: Using Command Line
```bash
# Copy SQL file to container
docker cp skincare_db.sql $(docker-compose ps -q db):/tmp/

# Import database
docker-compose exec db mysql -u php_docker -ppassword skincare_db < /tmp/skincare_db.sql
```

### 3. Test Backend APIs

#### Test Database Connection:
```bash
curl http://localhost/test-db.php
```

#### Test User Profile:
```bash
curl "http://localhost/user/profile.php?id=1"
```

#### Test Profile Update:
```bash
curl -X POST "http://localhost/user/update-profile.php" \
  -H "Content-Type: application/json" \
  -d '{"CID":1,"CName":"Test User","CPhone":"123456789","Address":"Test Address","Gender":1,"SkinType":"Oily"}'
```

### 4. Frontend Configuration

The frontend is now configured to use Docker URLs:
- `http://localhost/` (primary)
- `http://localhost:80/` (explicit port)
- `http://127.0.0.1/` (IP fallback)

### 5. Troubleshooting

#### Check Container Logs:
```bash
# Check web server logs
docker-compose logs www

# Check database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f www
```

#### Restart Services:
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart www
```

#### Check Database Connection:
```bash
# Connect to database container
docker-compose exec db mysql -u php_docker -ppassword skincare_db

# Show tables
SHOW TABLES;

# Check customer data
SELECT * FROM Customer LIMIT 5;
```

#### Common Issues:

**Issue 1: Port 80 already in use**
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop Apache if running locally
sudo service apache2 stop
# or
sudo brew services stop httpd
```

**Issue 2: Database connection failed**
- Wait a few seconds for MySQL to fully start
- Check if database service is running: `docker-compose ps`
- Verify database credentials in `config/database.php`

**Issue 3: CORS errors**
- Make sure you're accessing via `http://localhost` not `file://`
- Check browser console for specific CORS errors

### 6. Development Workflow

#### Making Changes:
1. Edit PHP files directly (they're mounted as volumes)
2. Changes are reflected immediately
3. No need to rebuild container for PHP changes

#### Database Changes:
1. Make changes via phpMyAdmin or command line
2. Export updated schema if needed
3. Update `skincare_db.sql` file

#### Stopping Services:
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (careful - this deletes database data)
docker-compose down -v
```

### 7. Production Considerations

For production deployment:
1. Change default passwords in `docker-compose.yml`
2. Use environment variables for sensitive data
3. Add SSL/TLS configuration
4. Set up proper backup strategy for database
5. Configure proper logging

### 8. Useful Commands

```bash
# View running containers
docker ps

# Execute commands in container
docker-compose exec www bash
docker-compose exec db mysql -u root -ppassword

# View container resource usage
docker stats

# Clean up unused Docker resources
docker system prune
```

## Expected Behavior

After setup, your profile page should:
1. ✅ Load user data from database
2. ✅ Allow profile editing
3. ✅ Save changes to database
4. ✅ Display order history
5. ✅ Handle profile image uploads (localStorage)

The frontend will automatically detect the Docker backend and use the appropriate URLs.