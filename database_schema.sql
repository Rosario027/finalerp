-- FinalERP Database Schema
-- Run this SQL script in Railway PostgreSQL database to create all tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
	"id" SERIAL PRIMARY KEY,
	"name" text NOT NULL,
	"hsn_code" text NOT NULL,
	"category" text,
	"rate" numeric(10, 2) NOT NULL,
	"gst_percentage" numeric(5, 2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" SERIAL PRIMARY KEY,
	"invoice_number" text NOT NULL UNIQUE,
	"invoice_type" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"customer_gst" text,
	"payment_mode" text NOT NULL,
	"gst_mode" text NOT NULL DEFAULT 'inclusive',
	"subtotal" numeric(10, 2) NOT NULL,
	"gst_amount" numeric(10, 2) NOT NULL,
	"grand_total" numeric(10, 2) NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS "invoice_items" (
	"id" SERIAL PRIMARY KEY,
	"invoice_id" integer NOT NULL,
	"product_id" integer,
	"item_name" text NOT NULL,
	"hsn_code" text NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"gst_percentage" numeric(5, 2) NOT NULL,
	"gst_amount" numeric(10, 2) NOT NULL,
	"taxable_value" numeric(10, 2) NOT NULL,
	"cgst_percentage" numeric(5, 2) NOT NULL,
	"cgst_amount" numeric(10, 2) NOT NULL,
	"sgst_percentage" numeric(5, 2) NOT NULL,
	"sgst_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE,
	CONSTRAINT "invoice_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" SERIAL PRIMARY KEY,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS "settings" (
	"id" SERIAL PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create admin user with password: admin@2025
-- This is a pre-generated bcrypt hash for "admin@2025"
INSERT INTO users (username, password, role)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
)
ON CONFLICT (username) DO NOTHING;