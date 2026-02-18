-- ============================================================================
-- Sample Data for Gulhaji Plaza Laptop Marketplace
-- BSCS Final Year Project
-- ============================================================================

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, is_verified) VALUES
    ('customer@example.com', 'hashed_password_123', 'Ahmad', 'Khan', '03001234567', 'customer', true),
    ('vendor1@example.com', 'hashed_password_123', 'Muhammad', 'Ali', '03007654321', 'vendor', true),
    ('vendor2@example.com', 'hashed_password_123', 'Fatima', 'Ahmed', '03009876543', 'vendor', true);

-- ============================================================================
-- SAMPLE VENDORS
-- ============================================================================
INSERT INTO vendors (user_id, shop_name, shop_number, shop_floor, contact_person, contact_phone, is_verified) VALUES
    ((SELECT user_id FROM users WHERE email = 'vendor1@example.com'), 'Ali Electronics', 'Shop #123', 0, 'Muhammad Ali', '03007654321', true),
    ((SELECT user_id FROM users WHERE email = 'vendor2@example.com'), 'Tech World', 'Shop #45', 1, 'Fatima Ahmed', '03009876543', true);

-- ============================================================================
-- SAMPLE HARDWARE SPECS
-- ============================================================================
INSERT INTO hardware_specs (
    processor_brand, processor_model, processor_cores, processor_threads,
    processor_base_clock_ghz, processor_boost_clock_ghz,
    ram_gb, ram_type, ram_slots, max_ram_gb,
    storage_type, storage_capacity_gb, additional_storage_slots,
    display_size_inches, display_resolution, display_type, refresh_rate_hz,
    gpu_type, gpu_brand, gpu_model, vram_gb,
    weight_kg, thickness_mm, battery_whr,
    has_wifi_6, has_bluetooth, usb_c_ports, usb_a_ports, hdmi_ports
) VALUES
    -- Dell XPS 15
    ('Intel', 'Core i7-13700H', 14, 20, 2.40, 5.00,
     16, 'DDR5', 2, 64,
     'NVMe SSD', 512, 1,
     15.6, '3840x2400', 'OLED', 60,
     'Integrated', 'Intel', 'Iris Xe', 0,
     1.86, 18.0, 86,
     true, true, 2, 2, 1),

    -- MacBook Pro 14
    ('Apple', 'M3 Pro', 12, 12, 2.60, 4.00,
     18, 'LPDDR5', 0, 18,
     'NVMe SSD', 512, 0,
     14.2, '3024x1964', 'IPS', 120,
     'Integrated', 'Apple', 'M3 Pro GPU', 0,
     1.61, 15.5, 70,
     true, true, 3, 0, 0),

    -- Lenovo Legion 5 (Gaming)
    ('AMD', 'Ryzen 7 7840HS', 8, 16, 3.80, 5.10,
     16, 'DDR5', 2, 32,
     'NVMe SSD', 1024, 1,
     15.6, '2560x1440', 'IPS', 165,
     'Dedicated', 'NVIDIA', 'RTX 4060', 8,
     2.40, 22.0, 80,
     true, true, 2, 2, 1),

    -- HP Pavilion (Budget)
    ('Intel', 'Core i5-13400H', 12, 16, 2.40, 4.60,
     16, 'DDR4', 2, 32,
     'NVMe SSD', 512, 0,
     15.6, '1920x1080', 'IPS', 60,
     'Integrated', 'Intel', 'UHD Graphics', 0,
     1.75, 19.0, 52,
     true, true, 1, 2, 1),

    -- ASUS ROG Strix (Gaming)
    ('Intel', 'Core i7-13700H', 14, 20, 2.40, 5.00,
     32, 'DDR5', 2, 64,
     'NVMe SSD', 1024, 1,
     15.6, '2560x1440', 'IPS', 240,
     'Dedicated', 'NVIDIA', 'RTX 4070', 8,
     2.30, 23.0, 90,
     true, true, 2, 2, 1),

    -- Dell Inspiron (Office)
    ('Intel', 'Core i5-1335U', 10, 12, 1.30, 4.60,
     8, 'DDR4', 2, 32,
     'NVMe SSD', 256, 0,
     15.6, '1920x1080', 'IPS', 60,
     'Integrated', 'Intel', 'Iris Xe', 0,
     1.70, 18.5, 54,
     true, true, 1, 2, 1),

    -- Lenovo ThinkPad (Business)
    ('Intel', 'Core i7-1355U', 10, 12, 1.70, 5.00,
     16, 'DDR4', 2, 64,
     'NVMe SSD', 512, 1,
     14.0, '1920x1200', 'IPS', 60,
     'Integrated', 'Intel', 'Iris Xe', 0,
     1.47, 17.0, 57,
     true, true, 2, 2, 1),

    -- HP Spectre x360 (2-in-1)
    ('Intel', 'Core i7-1355U', 10, 12, 1.70, 5.00,
     16, 'LPDDR4X', 0, 16,
     'NVMe SSD', 1024, 0,
     13.5, '3000x2000', 'OLED', 60,
     'Integrated', 'Intel', 'Iris Xe', 0,
     1.36, 16.0, 66,
     true, true, 2, 0, 0),

    -- ASUS ZenBook (Ultrabook)
    ('Intel', 'Core i7-1360P', 12, 16, 2.20, 5.00,
     16, 'LPDDR5', 0, 16,
     'NVMe SSD', 512, 0,
     14.0, '2880x1800', 'OLED', 120,
     'Integrated', 'Intel', 'Iris Xe', 0,
     1.39, 15.0, 75,
     true, true, 2, 0, 1),

    -- MSI Gaming Laptop
    ('Intel', 'Core i9-13900H', 14, 20, 2.60, 5.40,
     32, 'DDR5', 2, 64,
     'NVMe SSD', 2048, 1,
     17.3, '2560x1440', 'IPS', 240,
     'Dedicated', 'NVIDIA', 'RTX 4080', 12,
     2.80, 25.0, 99,
     true, true, 2, 3, 1);

-- ============================================================================
-- SAMPLE LAPTOP MODELS
-- ============================================================================
INSERT INTO laptop_models (brand_id, spec_id, model_name, model_number, series, release_year, short_description, product_image_url) VALUES
    ((SELECT brand_id FROM brands WHERE brand_slug = 'dell'), 
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i7-13700H' AND ram_gb = 16 LIMIT 1),
     'XPS 15 9530', 'XPS9530', 'Premium', 2024,
     'Premium laptop with stunning OLED display and powerful performance', '/images/dell-xps-15.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'apple'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'M3 Pro' LIMIT 1),
     'MacBook Pro 14"', 'MBP14-M3', 'Professional', 2024,
     'Apple''s professional laptop with M3 Pro chip', '/images/macbook-pro-14.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'lenovo'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Ryzen 7 7840HS' LIMIT 1),
     'Legion 5 Pro', 'LEG5PRO', 'Gaming', 2024,
     'High-performance gaming laptop with RTX 4060', '/images/legion-5-pro.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'hp'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i5-13400H' LIMIT 1),
     'Pavilion Gaming 15', 'PAV15', 'Budget Gaming', 2024,
     'Affordable gaming laptop for entry-level gamers', '/images/hp-pavilion.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'asus'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i7-13700H' AND ram_gb = 32 LIMIT 1),
     'ROG Strix G16', 'ROGSTRIX16', 'Gaming', 2024,
     'Premium gaming laptop with RTX 4070', '/images/asus-rog-strix.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'dell'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i5-1335U' LIMIT 1),
     'Inspiron 15 3530', 'INS153530', 'Home & Office', 2024,
     'Reliable everyday laptop for home and office use', '/images/dell-inspiron.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'lenovo'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i7-1355U' AND ram_gb = 16 LIMIT 1),
     'ThinkPad X1 Carbon', 'X1CARBON', 'Business', 2024,
     'Ultra-lightweight business laptop', '/images/thinkpad-x1.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'hp'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i7-1355U' AND display_size_inches = 13.5 LIMIT 1),
     'Spectre x360 13.5', 'SPECTRE135', '2-in-1', 2024,
     'Premium 2-in-1 convertible with OLED display', '/images/hp-spectre.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'asus'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i7-1360P' LIMIT 1),
     'ZenBook 14 OLED', 'ZEN14OLED', 'Ultrabook', 2024,
     'Compact ultrabook with stunning OLED display', '/images/asus-zenbook.jpg'),

    ((SELECT brand_id FROM brands WHERE brand_slug = 'msi'),
     (SELECT spec_id FROM hardware_specs WHERE processor_model = 'Core i9-13900H' LIMIT 1),
     'Raider GE78', 'RAIDER78', 'Gaming', 2024,
     'Ultimate gaming powerhouse with RTX 4080', '/images/msi-raider.jpg');

-- ============================================================================
-- SAMPLE INVENTORY
-- ============================================================================
INSERT INTO inventory (vendor_id, model_id, unit_price, original_price, discount_percentage, stock_quantity, condition_type, warranty_months, is_featured) VALUES
    -- Ali Electronics inventory
    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Ali Electronics'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'XPS 15 9530'),
     249999, 279999, 10.71, 5, 'New', 24, true),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Ali Electronics'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'MacBook Pro 14"'),
     329999, 349999, 5.71, 3, 'New', 12, true),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Ali Electronics'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'Legion 5 Pro'),
     189999, 209999, 9.52, 8, 'New', 24, false),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Ali Electronics'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'Pavilion Gaming 15'),
     159999, 179999, 11.11, 12, 'New', 12, false),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Ali Electronics'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'ROG Strix G16'),
     299999, 329999, 9.09, 4, 'New', 24, true),

    -- Tech World inventory
    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Tech World'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'Inspiron 15 3530'),
     119999, 139999, 14.29, 15, 'New', 12, false),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Tech World'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'ThinkPad X1 Carbon'),
     279999, 299999, 6.67, 6, 'New', 36, true),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Tech World'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'Spectre x360 13.5'),
     259999, 279999, 7.14, 4, 'New', 24, false),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Tech World'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'ZenBook 14 OLED'),
     199999, 219999, 9.09, 7, 'New', 24, false),

    ((SELECT vendor_id FROM vendors WHERE shop_name = 'Tech World'),
     (SELECT model_id FROM laptop_models WHERE model_name = 'Raider GE78'),
     449999, 499999, 10.00, 2, 'New', 24, true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify data was inserted:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM vendors;
-- SELECT COUNT(*) FROM hardware_specs;
-- SELECT COUNT(*) FROM laptop_models;
-- SELECT COUNT(*) FROM inventory;
