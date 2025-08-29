# Profile Page Database Issues - Debugging Guide

## Step 1: Start the Backend Server

```bash
# In the root directory, run:
php -S localhost:8080 start-server.php
```

## Step 2: Test Database Connection

Open your browser and go to: `http://localhost:8080/test-db.php`

This will show:
- Database connection status
- Number of customers in database
- Sample customer data
- Details for user ID 1

## Step 3: Test Update Functionality

Go to: `http://localhost:8080/test-update.php`

This will:
- Show current user data
- Perform a test update
- Show updated data
- Display rows affected

## Step 4: Check Frontend Console

1. Open your React app
2. Go to Profile page
3. Open browser Developer Tools (F12)
4. Check Console tab for debug messages
5. Try to update your profile

Look for these console messages:
- "Saving profile data: ..." - Shows what data is being sent
- "Trying to save to: ..." - Shows which URL is being tried
- "Response status: ..." - Shows HTTP response code
- "Response text: ..." - Shows raw response from server
- "Parsed response: ..." - Shows parsed JSON response

## Step 5: Common Issues and Solutions

### Issue 1: "User not found"
**Solution:** The user ID in localStorage doesn't match database
```javascript
// Check user ID in browser console:
console.log(JSON.parse(localStorage.getItem('user')));
```

### Issue 2: Database connection failed
**Solution:** Check database credentials in `config/database.php`
- Verify MySQL is running
- Check database name: `skincare_db`
- Check username/password

### Issue 3: CORS errors
**Solution:** Make sure server is running on port 8080
```bash
php -S localhost:8080 start-server.php
```

### Issue 4: "Invalid JSON input"
**Solution:** Check request format in browser Network tab

### Issue 5: Updates work but don't persist
**Solution:** Check if correct user ID is being used

## Step 6: Manual Database Check

Connect to your MySQL database and run:

```sql
-- Check if user exists
SELECT * FROM Customer WHERE CID = 1;

-- Check recent updates
SELECT * FROM Customer ORDER BY CID LIMIT 5;

-- Manual update test
UPDATE Customer SET CName = 'Test Manual Update' WHERE CID = 1;
SELECT * FROM Customer WHERE CID = 1;
```

## Step 7: Frontend Debugging

Add this to your browser console to test the API directly:

```javascript
// Test profile fetch
fetch('http://localhost:8080/user/profile.php?id=1')
  .then(r => r.text())
  .then(console.log);

// Test profile update
fetch('http://localhost:8080/user/update-profile.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    CID: 1,
    CName: 'Test Update',
    CPhone: '123456789',
    Address: 'Test Address',
    Gender: 1,
    SkinType: 'Oily'
  })
}).then(r => r.text()).then(console.log);
```

## Expected Responses

### Successful Profile Fetch:
```json
{
  "success": true,
  "user": {
    "CID": 1,
    "CName": "Kyaw Htet",
    "CPhone": "09123456789",
    "Address": "123 Yangon Road, Yangon",
    "CEmail": "Kyaw@example.com",
    "Gender": 1,
    "SkinType": "Oily"
  }
}
```

### Successful Profile Update:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "rowsAffected": 1,
  "updatedData": {
    "CID": 1,
    "CName": "Updated Name",
    "CPhone": "123456789",
    "Address": "Updated Address",
    "Gender": 1,
    "SkinType": "Combination"
  }
}
```

## Troubleshooting Checklist

- [ ] MySQL server is running
- [ ] Database `skincare_db` exists and has data
- [ ] PHP server is running on port 8080
- [ ] User is logged in (check localStorage)
- [ ] User ID exists in database
- [ ] No CORS errors in browser console
- [ ] Network requests are reaching the server
- [ ] Server is returning valid JSON responses

## Quick Fix Commands

```bash
# Restart PHP server
php -S localhost:8080 start-server.php

# Check if port is in use
lsof -i :8080

# Test with curl
curl "http://localhost:8080/user/profile.php?id=1"
curl -X POST "http://localhost:8080/user/update-profile.php" \
  -H "Content-Type: application/json" \
  -d '{"CID":1,"CName":"Test"}'
```