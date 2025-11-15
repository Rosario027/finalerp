# How to Debug Login 500 Error on Railway

## Step 1: Check the Response Body

1. Open your browser DevTools (F12)
2. Go to **Network** tab
3. Clear the network log (🗑️ icon)
4. Try to login again
5. Find the failed `POST /api/auth/login` request (it will be red)
6. Click on it
7. Go to the **Response** tab (or **Preview** tab)
8. Copy the JSON response - it should look like:
   ```json
   {
     "message": "Server error",
     "error": "Database query timeout after 10000ms"
   }
   ```
   - The `error` field shows what actually failed

## Step 2: Check Railway Logs

1. Go to https://railway.app
2. Open your project
3. Click on your **finalerp** service
4. Click on the **Logs** tab
5. Try to login again
6. Look for log lines that start with:
   - `[LOGIN]` - Shows login flow
   - `[STORAGE]` - Shows database queries
7. Copy any error messages you see

## Step 3: Test Database Connection

Visit this URL in your browser:
```
https://finalerp-production.up.railway.app/api/health/db
```

This will tell you if the database is reachable.

## Common Issues and Fixes

### Issue 1: Database Connection Timeout
**Error:** `Database query timeout after 10000ms` or `connection timeout`
**Fix:**
- Check that `DATABASE_URL` is set in Railway Variables
- Verify the DATABASE_URL is correct (check Railway PostgreSQL service)
- Test the connection using the health endpoint above

### Issue 2: Table Does Not Exist
**Error:** `relation "users" does not exist` or `table does not exist`
**Fix:**
- Run database migrations:
  1. Go to Railway → Your service → Deployments
  2. Click on latest deployment → **Shell** tab
  3. Run: `npm run db:push`
  OR
  1. Connect to database using DB Code extension
  2. Run the SQL from `database_schema.sql`

### Issue 3: No Users in Database
**Error:** No error, but login fails with 401
**Fix:**
- Create admin user:
  1. Go to Railway → Your service → Deployments → Latest → **Shell**
  2. Run: `npm run seed`
  OR
  1. Connect to database
  2. Insert a user (you'll need to hash the password with bcrypt)

### Issue 4: DATABASE_URL Not Set
**Error:** `DATABASE_URL must be set` (app won't start)
**Fix:**
- Go to Railway → Your service → **Variables** tab
- Check if `DATABASE_URL` exists
- If not, add it from your PostgreSQL service

## What to Share

When asking for help, please share:
1. The `error` field from the response body
2. Any `[LOGIN]` or `[STORAGE]` log lines from Railway
3. What the `/api/health/db` endpoint returns

