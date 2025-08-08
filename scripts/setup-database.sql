-- Database Setup Script for Gros-Islet Business Directory
-- Run this in your Neon PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    contact JSONB,
    location VARCHAR(255),
    coordinates JSONB,
    hours JSONB,
    images TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    votes INTEGER DEFAULT 0,
    tags TEXT[],
    offers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample businesses (only if table is empty)
INSERT INTO businesses (name, category, description, location, tags, contact) 
SELECT * FROM (VALUES
    ('Gros-Islet Beach Bar', 'Restaurant', 'Local beach bar with fresh seafood and Caribbean cocktails', 'Gros-Islet Beach', ARRAY['beach', 'seafood', 'local', 'cocktails'], '{"phone": "+1758-123-4567", "email": "info@beachbar.com", "website": "https://beachbar.com"}'),
    ('Caribbean Crafts', 'Retail', 'Handmade local crafts and souvenirs by local artisans', 'Main Street', ARRAY['crafts', 'souvenirs', 'local', 'artisan'], '{"phone": "+1758-234-5678", "email": "hello@caribbeancrafts.com"}'),
    ('Island Tours', 'Tourism', 'Guided tours of Gros-Islet and surrounding areas with local experts', 'Tourist Center', ARRAY['tours', 'guided', 'local', 'adventure'], '{"phone": "+1758-345-6789", "email": "book@islandtours.com", "website": "https://islandtours.com"}'),
    ('Spice Garden Restaurant', 'Restaurant', 'Authentic Caribbean cuisine with local spices and fresh ingredients', 'Spice Garden Road', ARRAY['restaurant', 'caribbean', 'local', 'spices'], '{"phone": "+1758-456-7890", "email": "dine@spicegarden.com"}'),
    ('Sunset View Hotel', 'Accommodation', 'Boutique hotel with stunning sunset views over the Caribbean Sea', 'Sunset Point', ARRAY['hotel', 'accommodation', 'sunset', 'boutique'], '{"phone": "+1758-567-8901", "email": "stay@sunsetview.com", "website": "https://sunsetview.com"}')
) AS v(name, category, description, location, tags, contact)
WHERE NOT EXISTS (SELECT 1 FROM businesses LIMIT 1);

-- Insert sample events (only if table is empty)
INSERT INTO events (title, date, time, description, business_id) 
SELECT * FROM (VALUES
    ('Live Music Night', '2024-02-15', '19:00', 'Local musicians performing Caribbean music and reggae', (SELECT id FROM businesses WHERE name = 'Gros-Islet Beach Bar' LIMIT 1)),
    ('Craft Fair', '2024-02-20', '10:00', 'Local artisans showcasing their work with live demonstrations', (SELECT id FROM businesses WHERE name = 'Caribbean Crafts' LIMIT 1)),
    ('Sunset Dinner Special', '2024-02-18', '18:30', 'Special dinner menu with sunset views and live entertainment', (SELECT id FROM businesses WHERE name = 'Spice Garden Restaurant' LIMIT 1)),
    ('Island Adventure Tour', '2024-02-25', '09:00', 'Full-day guided tour of Gros-Islet and surrounding areas', (SELECT id FROM businesses WHERE name = 'Island Tours' LIMIT 1)),
    ('Caribbean Cooking Class', '2024-02-22', '14:00', 'Learn to cook authentic Caribbean dishes with local chefs', (SELECT id FROM businesses WHERE name = 'Spice Garden Restaurant' LIMIT 1))
) AS v(title, date, time, description, business_id)
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as business_count FROM businesses;
SELECT COUNT(*) as event_count FROM events;
