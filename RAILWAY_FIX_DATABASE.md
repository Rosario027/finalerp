# Fix DATABASE_URL Error in Railway

## Quick Fix Steps

### Step 1: Add PostgreSQL Database in Railway

1. **Go to your Railway project dashboard**
   - Visit https://railway.app
   - Open your project

2. **Add PostgreSQL Database**
   - Click the **"New"** button (usually in the top right or bottom of the services list)
   - Select **"Database"** → **"Add PostgreSQL"**
   - Railway will create a new PostgreSQL database service

3. **Link Database to Your App**
   - After the database is created, click on your **application service** (not the database)
   - Go to **"Variables"** tab
   - You should see `DATABASE_URL` automatically added (Railway does this when you add a database)
   - If you don't see it, click **"New Variable"** and Railway should suggest `DATABASE_URL` from the database service

4. **Redeploy**
   - Railway should automatically redeploy, or you can manually trigger a redeploy
   - Your app should now start successfully!

### Step 2: Run Database Migrations

After the app starts successfully:

1. Go to your **application service** → **"Deployments"** tab
2. Click on the latest deployment
3. Open the **"Shell"** tab
4. Run: `npm run db:push`
5. This will create all the necessary database tables

## Alternative: Use External Database (Neon, Supabase, etc.)

If you're using an external PostgreSQL database:

1. Go to your **application service** → **"Variables"** tab
2. Click **"New Variable"**
3. Name: `DATABASE_URL`
4. Value: Your PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://user:pass@db.example.com:5432/mydb`
5. Click **"Add"**
6. Redeploy your service

## Verify DATABASE_URL is Set

1. Go to your **application service** → **"Variables"** tab
2. Look for `DATABASE_URL` in the list
3. It should show a value (hidden for security)
4. If it's there, your app should work!

## Still Having Issues?

- Check Railway logs for any other errors
- Verify the database service is running (green status)
- Make sure you're setting the variable on the **application service**, not the database service
- Try redeploying after adding the variable

