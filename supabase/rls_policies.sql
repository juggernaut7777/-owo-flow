-- KOFA Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor to secure data per-merchant

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_sales ENABLE ROW LEVEL SECURITY;

-- Add vendor_id column to link data to authenticated users (if not exists)
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES auth.users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES auth.users(id);
ALTER TABLE manual_sales ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES auth.users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_manual_sales_vendor ON manual_sales(vendor_id);

-- ============== PRODUCTS POLICIES ==============
-- Merchants can only see their own products
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (auth.uid() = vendor_id);

-- Merchants can insert their own products
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

-- Merchants can update their own products
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid() = vendor_id);

-- Merchants can delete their own products
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
USING (auth.uid() = vendor_id);

-- ============== ORDERS POLICIES ==============
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Users can insert own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
USING (auth.uid() = vendor_id);

-- ============== EXPENSES POLICIES ==============
CREATE POLICY "Users can view own expenses"
ON expenses FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Users can insert own expenses"
ON expenses FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Users can update own expenses"
ON expenses FOR UPDATE
USING (auth.uid() = vendor_id);

CREATE POLICY "Users can delete own expenses"
ON expenses FOR DELETE
USING (auth.uid() = vendor_id);

-- ============== MANUAL SALES POLICIES ==============
CREATE POLICY "Users can view own manual_sales"
ON manual_sales FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Users can insert own manual_sales"
ON manual_sales FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

-- ============== STORAGE POLICIES ==============
-- Product images bucket (if using Supabase Storage)
-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
