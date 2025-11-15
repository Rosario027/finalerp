# How to Run SQL in Database Using DB Code Extension

## Step 1: Connect to Your Database

### Using DB Code Extension in VS Code:

1. **Install DB Code Extension** (if not already installed)
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "DB Code"
   - Install it

2. **Connect to Railway Database**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: `DB Code: Connect to Database`
   - Select it
   - Choose PostgreSQL
   - Enter your connection details:
     - **Connection String**: Get this from Railway → PostgreSQL service → Variables → `DATABASE_URL`
     - Format: `postgresql://username:password@host:port/database`
   - OR enter details separately:
     - **Host**: From Railway PostgreSQL settings
     - **Port**: Usually `5432`
     - **Database**: Usually `railway` or `postgres`
     - **Username**: `postgres` (or from Railway)
     - **Password**: From Railway Credentials tab

## Step 2: Run the SQL

### Method 1: Run the SQL File

1. **Open the SQL file**
   - Open `INSERT_ADMIN_USER.sql` in VS Code

2. **Select all the SQL** (Ctrl+A)

3. **Right-click and select "Execute Query"** or press `F5`

   OR

4. **Use Command Palette**
   - Press `Ctrl+Shift+P`
   - Type: `DB Code: Execute Query`
   - Select it

### Method 2: Run SQL from Database Connection Panel

1. **Open Database Connection**
   - Look for the database icon in the sidebar
   - Expand your database connection
   - Right-click on your database → "New Query"

2. **Paste the SQL**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

   INSERT INTO users (username, password, role)
   VALUES (
     'admin',
     '$2b$10$.3Dd5MtmHGMYnvfxyPvKHegWDd5S9Aa2BUDFqDkb4KoN/wz.a6in2',
     'admin'
   )
   ON CONFLICT (username) DO UPDATE
   SET password = EXCLUDED.password,
       role = EXCLUDED.role;
   ```

3. **Run the query** (click Run button or press F5)

## Step 3: Verify User Was Created

Run this SQL to check:

```sql
SELECT id, username, role FROM users WHERE username = 'admin';
```

You should see a row with:
- username: `admin`
- role: `admin`

## Troubleshooting

### Error: "relation users does not exist"
- **Fix**: The users table doesn't exist. Run `database_schema.sql` first to create all tables.

### Error: "permission denied"
- **Fix**: Make sure you're connected to the correct database and have write permissions.

### Error: "extension pgcrypto does not exist"
- **Fix**: Run this first:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  ```

### Database not updating after running SQL
- **Check**: Make sure you clicked "Execute" or pressed F5
- **Check**: Check the output/result panel for any errors
- **Check**: Try running the verification query to see if user exists
- **Check**: Make sure you're connected to the correct database (not a different one)

### Connection Issues
- Verify your DATABASE_URL from Railway is correct
- Check that Railway PostgreSQL service is running
- Ensure your IP is allowed (Railway usually allows all IPs)

## Quick Copy-Paste SQL

If you just want to quickly run the SQL, copy and paste this:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO users (username, password, role)
VALUES ('admin', '$2b$10$.3Dd5MtmHGMYnvfxyPvKHegWDd5S9Aa2BUDFqDkb4KoN/wz.a6in2', 'admin')
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, role = EXCLUDED.role;

SELECT id, username, role FROM users WHERE username = 'admin';
```

Run this in your database connector, and you should see the admin user created!

