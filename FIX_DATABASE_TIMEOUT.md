# Fix Database Query Timeout Error

## Error Message
```
{"message":"Server error","error":"Database query timeout after 10008ms"}
```

This means your app cannot connect to the database.

## Step 1: Verify DATABASE_URL in Railway

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Open your project
   - Click on your **application service** (not the database)

2. **Check Variables Tab**
   - Click on **"Variables"** tab
   - Look for `DATABASE_URL`
   - **If it doesn't exist**, you need to add it (see Step 2)
   - **If it exists**, verify it's correct (see Step 3)

## Step 2: Add DATABASE_URL (If Missing)

### Option A: Using Railway PostgreSQL Database

1. **Add PostgreSQL Database**
   - In your Railway project, click **"New"** button
   - Select **"Database"** → **"Add PostgreSQL"**
   - Railway will create a PostgreSQL database

2. **Link to Your App**
   - Click on your **application service**
   - Go to **"Variables"** tab
   - Railway should automatically add `DATABASE_URL`
   - If not, click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: Click the dropdown and select the variable from your PostgreSQL service
   - Click **"Add"**

3. **Redeploy**
   - Railway should auto-redeploy, or manually trigger a redeploy

### Option B: Using External Database (Neon, Supabase, etc.)

1. **Get Connection String**
   - From your database provider (Neon, Supabase, etc.)
   - Copy the full connection string
   - Format: `postgresql://username:password@host:port/database`
   - For Neon: Should include `?sslmode=require` or similar

2. **Add to Railway**
   - Go to your **application service** → **"Variables"** tab
   - Click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: Paste your connection string
   - Click **"Add"**

3. **Redeploy**
   - Railway should auto-redeploy

## Step 3: Verify DATABASE_URL Format

The connection string should look like one of these:

**Railway PostgreSQL:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Neon:**
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**Common Issues:**
- ❌ Missing `postgresql://` prefix
- ❌ Wrong password or username
- ❌ Incorrect host/endpoint
- ❌ Missing SSL parameters for Neon (`?sslmode=require`)

## Step 4: Test Database Connection

After setting DATABASE_URL, test it:

1. **Visit Health Endpoint**
   ```
   https://finalerp-production.up.railway.app/api/health/db
   ```
   - Should return: `{"status":"ok",...}` if connection works
   - Will show error if connection fails

2. **Check Railway Logs**
   - Go to Railway → Your service → **Logs** tab
   - Look for any database connection errors
   - Should see `[LOGIN]` logs when you try to login

## Step 5: Create Database Tables (If Not Done)

If connection works but you get "table does not exist" errors:

1. **Using Railway Shell**
   - Railway → Your service → **Deployments** → Latest → **Shell** tab
   - Run: `npm run db:push`

2. **Using Railway Query Tab**
   - Railway → PostgreSQL service → **Query** tab
   - Copy contents of `database_schema.sql`
   - Paste and run

## Step 6: Create Admin User

After tables are created:

1. **Using Railway Shell**
   - Railway → Your service → **Deployments** → Latest → **Shell** tab
   - Run: `npm run seed`
   - This creates: `admin` / `admin@2025`

2. **Or Using SQL**
   - Connect to database
   - Run SQL to create user (need to hash password with bcrypt)

## Troubleshooting

### Still Getting Timeout?

1. **Check if Database is Suspended (Neon)**
   - Neon databases suspend after inactivity
   - First connection after suspension takes longer
   - Try connecting again (it should wake up)

2. **Check Network/Firewall**
   - Ensure Railway can reach your database
   - Check if database allows connections from Railway IPs

3. **Verify Connection String**
   - Double-check username, password, host, port
   - For Neon, ensure SSL parameters are correct

4. **Check Railway Logs**
   - Look for detailed error messages
   - Check `[LOGIN]` and `[STORAGE]` logs

### Test Locally

To test if DATABASE_URL works:

1. Set DATABASE_URL in your local `.env` file
2. Run: `npm run dev`
3. Try to login
4. Check if it works locally

If it works locally but not on Railway, the DATABASE_URL in Railway is likely wrong.

## Quick Checklist

- [ ] DATABASE_URL exists in Railway Variables
- [ ] DATABASE_URL format is correct (starts with `postgresql://`)
- [ ] Database is accessible (test with `/api/health/db`)
- [ ] Database tables exist (run `npm run db:push`)
- [ ] At least one user exists (run `npm run seed`)

