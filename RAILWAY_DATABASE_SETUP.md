# Railway Database Setup Guide

## How to Create Tables in Railway Database

### Method 1: Using Railway's Query Tab (Easiest)

1. **Go to your Railway project dashboard**
   - Visit https://railway.app
   - Open your project

2. **Open PostgreSQL Database**
   - Click on your **PostgreSQL service** (the database, not your app)
   - Click on the **"Query"** tab

3. **Copy and Paste the SQL**
   - Open the file `database_schema.sql` from this project
   - Copy the entire contents
   - Paste it into the Query tab in Railway

4. **Run the SQL**
   - Click **"Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
   - You should see a success message

5. **Verify Tables Created**
   - In the Query tab, run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - You should see: `users`, `products`, `invoices`, `invoice_items`, `expenses`, `settings`

### Method 2: Using Railway Shell (Alternative)

1. **Open Railway Shell**
   - Go to your **application service** (not the database)
   - Click on **"Deployments"** → Latest deployment → **"Shell"** tab

2. **Run Migration Command**
   ```bash
   npm run db:push
   ```
   - This will automatically create all tables based on your schema

### Method 3: Using psql Command Line

1. **Get Database Connection String**
   - Go to your PostgreSQL service in Railway
   - Click on **"Variables"** tab
   - Copy the `DATABASE_URL` value

2. **Connect to Database**
   ```bash
   psql "your-database-url-here"
   ```

3. **Run SQL Script**
   ```sql
   \i database_schema.sql
   ```
   Or copy-paste the contents of `database_schema.sql`

## Tables Created

The schema creates the following tables:

1. **users** - User accounts and authentication
2. **products** - Product inventory
3. **invoices** - Invoice records
4. **invoice_items** - Items in each invoice
5. **expenses** - Expense tracking
6. **settings** - Application settings

## Verify Setup

After creating tables, verify with this query:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## Create Default Admin User (Optional)

After tables are created, you can create an admin user:

```sql
-- Password should be hashed with bcrypt in your application
-- This is just an example - use your application's registration/login endpoint instead
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin');
```

**Note:** It's better to create users through your application's registration/login system, which will properly hash passwords.

## Troubleshooting

### Error: "relation already exists"
- Tables might already be created
- You can drop and recreate, or use `CREATE TABLE IF NOT EXISTS` (already in the script)

### Error: "permission denied"
- Make sure you're connected to the correct database
- Check that you have proper permissions

### Tables not showing up
- Refresh the Railway dashboard
- Check if you're looking at the correct database
- Verify the SQL ran without errors

## Next Steps

After creating tables:
1. Your application should now start successfully
2. You can access your app at the Railway-provided URL
3. Use the registration/login endpoints to create your first admin user

