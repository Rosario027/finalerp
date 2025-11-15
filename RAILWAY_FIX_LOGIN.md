# Fix Login 500 Error in Railway

## Problem
You're getting a 500 error when trying to login. This is likely because:
1. **No users exist in the database** - The most common cause
2. **Database connection issue** - Less likely since the app is running

## Solution: Create Admin User

### Method 1: Use Seed Script (Recommended)

1. **Go to Railway Dashboard**
   - Open your **finalerp** service
   - Go to **"Deployments"** → Latest deployment → **"Shell"** tab

2. **Run Seed Script**
   ```bash
   npm run seed
   ```

3. **This creates:**
   - Admin user: `admin` / `admin@2025`
   - Regular user: `user` / `user123`
   - Sample products

4. **Try logging in** with:
   - Username: `admin`
   - Password: `admin@2025`

### Method 2: Create User via SQL

1. **Connect to Database** using DB Code extension

2. **Run this SQL** (you'll need to generate a bcrypt hash):
   ```sql
   -- First, generate a bcrypt hash for "admin@2025"
   -- You can use an online bcrypt generator or run the seed script
   
   INSERT INTO users (username, password, role)
   VALUES (
     'admin',
     '$2a$10$YourBcryptHashHere',
     'admin'
   )
   ON CONFLICT (username) DO NOTHING;
   ```

3. **Generate bcrypt hash:**
   - Visit: https://bcrypt-generator.com/
   - Enter password: `admin@2025`
   - Rounds: `10`
   - Copy the hash and use it in the SQL above

### Method 3: Use API to Create User (After fixing login)

If you can get admin access, you can create users via the API:
```bash
POST /api/users
Authorization: Bearer <admin-token>
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

## Verify Users Exist

Run this SQL query to check:
```sql
SELECT id, username, role FROM users;
```

You should see at least one user (the admin).

## Test Login

After creating a user, try logging in:
- **URL**: `https://your-app.railway.app/api/auth/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "admin@2025"
  }
  ```

## Still Getting 500 Error?

Check the Railway logs for the actual error message. The improved error logging should now show the real error instead of just "Server error".

1. Go to Railway → Your service → **"Logs"** tab
2. Look for error messages when you try to login
3. Share the error message for further debugging

## Default Credentials (After Seeding)

- **Admin**: `admin` / `admin@2025`
- **User**: `user` / `user123`


