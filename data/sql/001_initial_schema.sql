-- ============================================================================
-- 3NF PostgreSQL Schema for "AI Powered Laptop Recommendation and Marketplace"
-- Gulhaji Plaza - BSCS Final Year Project
-- 
-- Design Principles:
-- - Third Normal Form (3NF): All non-key attributes depend on the key, 
--   the whole key, and nothing but the key
-- - ACID Compliance: Atomicity, Consistency, Isolation, Durability
-- - Referential Integrity: Foreign key constraints with cascading rules
-- ============================================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: brands
-- Description: Master table for laptop brand information
-- 3NF Compliance: Brand attributes depend solely on brand_id
-- ============================================================================
CREATE TABLE brands (
    brand_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    brand_slug VARCHAR(100) NOT NULL UNIQUE,
    country_of_origin VARCHAR(100),
    official_website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: No transitive dependencies
    CONSTRAINT chk_brand_name_not_empty CHECK (LENGTH(TRIM(brand_name)) > 0),
    CONSTRAINT chk_brand_slug_format CHECK (brand_slug ~ '^[a-z0-9-]+$')
);

-- Index for brand lookups
CREATE INDEX idx_brands_slug ON brands(brand_slug);
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE: users
-- Description: User accounts for customers and vendors
-- 3NF Compliance: User attributes depend solely on user_id
-- ACID: Transaction-safe with proper constraints
-- ============================================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: No transitive dependencies
    -- ACID: Constraints ensure data integrity
    CONSTRAINT chk_user_type CHECK (user_type IN ('customer', 'vendor', 'admin')),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_first_name_not_empty CHECK (LENGTH(TRIM(first_name)) > 0),
    CONSTRAINT chk_last_name_not_empty CHECK (LENGTH(TRIM(last_name)) > 0)
);

-- Index for user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE: hardware_specs
-- Description: Normalized hardware specifications for laptops
-- 3NF Compliance: Each spec attribute depends solely on spec_id
-- Note: Separated from inventory for normalization (one spec can exist 
--       independently of inventory)
-- ============================================================================
CREATE TABLE hardware_specs (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Processor attributes (depend on spec_id)
    processor_brand VARCHAR(100) NOT NULL,
    processor_model VARCHAR(200) NOT NULL,
    processor_cores INTEGER NOT NULL,
    processor_threads INTEGER NOT NULL,
    processor_base_clock_ghz DECIMAL(4,2) NOT NULL,
    processor_boost_clock_ghz DECIMAL(4,2),
    
    -- Memory attributes (depend on spec_id)
    ram_gb INTEGER NOT NULL,
    ram_type VARCHAR(50) NOT NULL, -- DDR4, DDR5, LPDDR4X, etc.
    ram_slots INTEGER,
    max_ram_gb INTEGER,
    
    -- Storage attributes (depend on spec_id)
    storage_type VARCHAR(50) NOT NULL, -- SSD, HDD, NVMe, etc.
    storage_capacity_gb INTEGER NOT NULL,
    additional_storage_slots INTEGER DEFAULT 0,
    
    -- Display attributes (depend on spec_id)
    display_size_inches DECIMAL(3,1) NOT NULL,
    display_resolution VARCHAR(20) NOT NULL, -- 1920x1080, 2560x1440, etc.
    display_type VARCHAR(50) NOT NULL, -- IPS, OLED, TN, etc.
    refresh_rate_hz INTEGER DEFAULT 60,
    touch_screen BOOLEAN DEFAULT FALSE,
    
    -- Graphics attributes (depend on spec_id)
    gpu_type VARCHAR(50) NOT NULL, -- Integrated, Dedicated
    gpu_brand VARCHAR(100),
    gpu_model VARCHAR(200),
    vram_gb INTEGER,
    
    -- Physical attributes (depend on spec_id)
    weight_kg DECIMAL(4,2),
    thickness_mm DECIMAL(4,2),
    battery_whr INTEGER,
    
    -- Connectivity (depend on spec_id)
    has_wifi_6 BOOLEAN DEFAULT TRUE,
    has_bluetooth BOOLEAN DEFAULT TRUE,
    usb_c_ports INTEGER DEFAULT 0,
    usb_a_ports INTEGER DEFAULT 0,
    hdmi_ports INTEGER DEFAULT 0,
    
    -- Metadata
    spec_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on spec_id only
    -- ACID: Constraints ensure valid data
    CONSTRAINT chk_processor_cores CHECK (processor_cores >= 1),
    CONSTRAINT chk_processor_threads CHECK (processor_threads >= processor_cores),
    CONSTRAINT chk_ram_gb CHECK (ram_gb >= 1),
    CONSTRAINT chk_storage_capacity CHECK (storage_capacity_gb >= 1),
    CONSTRAINT chk_display_size CHECK (display_size_inches >= 10 AND display_size_inches <= 21),
    CONSTRAINT chk_refresh_rate CHECK (refresh_rate_hz >= 60),
    CONSTRAINT chk_gpu_type CHECK (gpu_type IN ('Integrated', 'Dedicated', 'Hybrid')),
    CONSTRAINT chk_weight CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 10)),
    CONSTRAINT chk_ports CHECK (usb_c_ports >= 0 AND usb_a_ports >= 0 AND hdmi_ports >= 0)
);

-- Index for spec searches (AI recommendation engine)
CREATE INDEX idx_specs_processor ON hardware_specs(processor_brand, processor_model);
CREATE INDEX idx_specs_ram ON hardware_specs(ram_gb);
CREATE INDEX idx_specs_storage ON hardware_specs(storage_type, storage_capacity_gb);
CREATE INDEX idx_specs_gpu ON hardware_specs(gpu_type, gpu_brand);
CREATE INDEX idx_specs_display ON hardware_specs(display_size_inches, display_resolution);
CREATE INDEX idx_specs_price_range ON hardware_specs(spec_id) WHERE spec_version = 1;

-- ============================================================================
-- TABLE: laptop_models
-- Description: Laptop model information linking brands to specifications
-- 3NF Compliance: Model attributes depend solely on model_id
-- Bridge table between brands and hardware_specs
-- ============================================================================
CREATE TABLE laptop_models (
    model_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    spec_id UUID NOT NULL REFERENCES hardware_specs(spec_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    model_name VARCHAR(200) NOT NULL,
    model_number VARCHAR(100),
    series VARCHAR(100), -- Gaming, Ultrabook, Workstation, etc.
    release_year INTEGER,
    
    -- Marketing attributes
    short_description VARCHAR(500),
    full_description TEXT,
    product_image_url VARCHAR(500),
    
    -- Metadata
    is_discontinued BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: No transitive dependencies
    CONSTRAINT chk_model_name_not_empty CHECK (LENGTH(TRIM(model_name)) > 0),
    CONSTRAINT chk_release_year CHECK (release_year IS NULL OR (release_year >= 2000 AND release_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1)),
    UNIQUE (brand_id, model_name, spec_id)
);

-- Index for model lookups
CREATE INDEX idx_laptop_models_brand ON laptop_models(brand_id);
CREATE INDEX idx_laptop_models_spec ON laptop_models(spec_id);
CREATE INDEX idx_laptop_models_series ON laptop_models(series);
CREATE INDEX idx_laptop_models_active ON laptop_models(is_discontinued) WHERE is_discontinued = FALSE;

-- ============================================================================
-- TABLE: vendors
-- Description: Vendor/shop information for Gulhaji Plaza shopkeepers
-- 3NF Compliance: Vendor attributes depend solely on vendor_id
-- ============================================================================
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    shop_name VARCHAR(200) NOT NULL,
    shop_number VARCHAR(50),
    shop_floor INTEGER,
    plaza_name VARCHAR(100) DEFAULT 'Gulhaji Plaza',
    
    contact_person VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Business attributes
    business_license VARCHAR(100),
    tax_number VARCHAR(50),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on vendor_id
    CONSTRAINT chk_shop_name_not_empty CHECK (LENGTH(TRIM(shop_name)) > 0)
);

-- Index for vendor lookups
CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_verified ON vendors(is_verified) WHERE is_verified = TRUE;

-- ============================================================================
-- TABLE: inventory
-- Description: Inventory items for vendors in Gulhaji Plaza
-- 3NF Compliance: Inventory attributes depend solely on inventory_id
-- ACID: Stock quantity managed with constraints
-- ============================================================================
CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE ON UPDATE CASCADE,
    model_id UUID NOT NULL REFERENCES laptop_models(model_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Pricing (ACID: DECIMAL for precise monetary values)
    unit_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Stock management (ACID: Check constraints)
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_threshold INTEGER DEFAULT 1,
    
    -- Condition and warranty
    condition_type VARCHAR(50) NOT NULL DEFAULT 'New',
    warranty_months INTEGER DEFAULT 12,
    warranty_type VARCHAR(100), -- Manufacturer, Vendor, etc.
    
    -- Item-specific notes
    item_condition_notes TEXT,
    internal_sku VARCHAR(100),
    
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on inventory_id
    -- ACID: Constraints ensure data integrity
    CONSTRAINT chk_unit_price CHECK (unit_price > 0),
    CONSTRAINT chk_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CONSTRAINT chk_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT chk_reserved_quantity CHECK (reserved_quantity >= 0 AND reserved_quantity <= stock_quantity),
    CONSTRAINT chk_condition_type CHECK (condition_type IN ('New', 'Open Box', 'Refurbished', 'Used - Like New', 'Used - Good', 'Used - Fair')),
    CONSTRAINT chk_warranty_months CHECK (warranty_months >= 0)
);

-- Index for inventory queries
CREATE INDEX idx_inventory_vendor ON inventory(vendor_id);
CREATE INDEX idx_inventory_model ON inventory(model_id);
CREATE INDEX idx_inventory_price ON inventory(unit_price);
CREATE INDEX idx_inventory_available ON inventory(is_available, stock_quantity) WHERE is_available = TRUE AND stock_quantity > 0;
CREATE INDEX idx_inventory_featured ON inventory(is_featured) WHERE is_featured = TRUE;

-- ============================================================================
-- TABLE: recommendations
-- Description: AI-generated laptop recommendations for users
-- 3NF Compliance: Recommendation data depends solely on recommendation_id
-- ============================================================================
CREATE TABLE recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- AI scoring
    model_id UUID NOT NULL REFERENCES laptop_models(model_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    relevance_score DECIMAL(5,4) NOT NULL,
    confidence_score DECIMAL(5,4),
    
    -- Recommendation context
    recommendation_reason TEXT,
    matched_features TEXT[], -- Array of matched user preferences
    
    -- Session tracking
    session_id UUID,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on recommendation_id
    CONSTRAINT chk_relevance_score CHECK (relevance_score >= 0 AND relevance_score <= 1),
    CONSTRAINT chk_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Index for recommendation queries
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_model ON recommendations(model_id);
CREATE INDEX idx_recommendations_score ON recommendations(relevance_score DESC);
CREATE INDEX idx_recommendations_session ON recommendations(session_id);

-- ============================================================================
-- TABLE: user_preferences
-- Description: User preferences for AI recommendation engine
-- 3NF Compliance: Preference attributes depend solely on preference_id
-- ============================================================================
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Budget preferences
    min_budget DECIMAL(10,2),
    max_budget DECIMAL(10,2),
    
    -- Usage patterns
    primary_usage VARCHAR(50), -- Gaming, Programming, Design, Office, etc.
    secondary_usages VARCHAR(50)[],
    
    -- Hardware preferences
    preferred_brands UUID[] REFERENCES brands(brand_id),
    min_ram_gb INTEGER,
    min_storage_gb INTEGER,
    preferred_gpu_type VARCHAR(50),
    min_display_size DECIMAL(3,1),
    
    -- Portability preferences
    max_weight_kg DECIMAL(4,2),
    prefer_thin_and_light BOOLEAN DEFAULT FALSE,
    
    -- Other preferences
    must_have_features TEXT[],
    deal_breakers TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on preference_id
    CONSTRAINT chk_budget_range CHECK (min_budget IS NULL OR max_budget IS NULL OR min_budget <= max_budget),
    CONSTRAINT chk_primary_usage CHECK (primary_usage IN ('Gaming', 'Programming', 'Design', 'Video Editing', 'Office', 'Student', 'General', 'Workstation'))
);

-- Index for preference lookups
CREATE INDEX idx_preferences_user ON user_preferences(user_id);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_specs_updated_at BEFORE UPDATE ON hardware_specs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laptop_models_updated_at BEFORE UPDATE ON laptop_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Initial brands for Gulhaji Plaza marketplace
-- ============================================================================
INSERT INTO brands (brand_name, brand_slug, country_of_origin) VALUES
    ('Dell', 'dell', 'USA'),
    ('HP', 'hp', 'USA'),
    ('Lenovo', 'lenovo', 'China'),
    ('Asus', 'asus', 'Taiwan'),
    ('Acer', 'acer', 'Taiwan'),
    ('Apple', 'apple', 'USA'),
    ('MSI', 'msi', 'Taiwan'),
    ('Razer', 'razer', 'USA'),
    ('Samsung', 'samsung', 'South Korea'),
    ('LG', 'lg', 'South Korea');

-- ============================================================================
-- COMMENTS: Document table purposes for data provenance
-- ============================================================================
COMMENT ON TABLE brands IS 'Master table for laptop brand information (3NF normalized)';
COMMENT ON TABLE users IS 'User accounts for customers and vendors with ACID compliance';
COMMENT ON TABLE hardware_specs IS 'Normalized hardware specifications independent of inventory';
COMMENT ON TABLE laptop_models IS 'Bridge table linking brands to hardware specifications';
COMMENT ON TABLE vendors IS 'Gulhaji Plaza shopkeeper information';
COMMENT ON TABLE inventory IS 'Vendor inventory with ACID-compliant stock management';
COMMENT ON TABLE recommendations IS 'AI-generated laptop recommendations with scoring';
COMMENT ON TABLE user_preferences IS 'User preferences for AI recommendation engine';
