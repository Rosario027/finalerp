# Connect to Railway Database using DB Code Extension

## Step 1: Get Connection Details from Railway

1. **Go to Railway Dashboard**
   - Open your PostgreSQL service (the "Postgres" service)

2. **Get the Connection String**
   - Click on the **"Variables"** tab in your PostgreSQL service
   - Look for `DATABASE_URL` or `POSTGRES_URL`
   - Copy the entire connection string
   
   OR
   
   - Go to **"Credentials"** tab
   - Copy:
     - Username: `postgres`
     - Password: (click eye icon to reveal)
   - Go to **"Settings"** tab to find:
     - Host/Endpoint
     - Port (usually 5432)
     - Database name (usually `railway` or `postgres`)

## Step 2: Connect using DB Code Extension

### Method 1: Using Connection String (Easiest)

1. **Open VS Code Command Palette**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)

2. **Connect to Database**
   - Type: `DB Code: Connect to Database`
   - Select it

3. **Enter Connection String**
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://postgres:yourpassword@containers-us-west-xxx.railway.app:5432/railway`
   - Paste your `DATABASE_URL` from Railway Variables

### Method 2: Using Connection Details

1. **Open Command Palette**: `Ctrl+Shift+P`

2. **Type**: `DB Code: Add Connection`

3. **Select**: PostgreSQL

4. **Enter Details**:
   - **Host**: `containers-us-west-xxx.railway.app` (from Railway)
   - **Port**: `5432` (or the port shown in Railway)
   - **Database**: `railway` or `postgres` (check Railway settings)
   - **Username**: `postgres`
   - **Password**: (from Railway Credentials tab)
   - **Connection Name**: `Railway PostgreSQL` (any name you want)

5. **Click Connect**

## Step 3: Run SQL Script

Once connected:

1. **Open SQL File**
   - Open `database_schema.sql` in VS Code

2. **Execute SQL**
   - Right-click in the SQL file
   - Select **"Execute Query"** or **"Run Query"**
   - OR use the command: `DB Code: Execute Query`

3. **Verify Tables Created**
   - In the DB Code extension sidebar, expand your connection
   - You should see all 6 tables:
     - users
     - products
     - invoices
     - invoice_items
     - expenses
     - settings

## Alternative: Get Connection String from Railway

The easiest way is to get the full connection string:

1. Go to your **finalerp** service (not the database)
2. Click **"Variables"** tab
3. Find `DATABASE_URL`
4. Copy the entire value
5. Use it in DB Code extension

The connection string format is:
```
postgresql://postgres:PASSWORD@HOST:PORT/DATABASE
```

