-- Database schema for Gros Islet Business Directory
-- This script should be run in your Neon database console

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    contact JSONB NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB,
    hours JSONB NOT NULL,
    images JSONB DEFAULT '[]',
    rating DECIMAL(2,1) DEFAULT 0,
    tags JSONB DEFAULT '[]',
    offers TEXT,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_votes ON businesses(votes DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date, time);
CREATE INDEX IF NOT EXISTS idx_events_business ON events(business_id);

-- Insert some sample data (optional)
INSERT INTO users (id, email, password_hash) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'owner1@example.com', '$2a$12$placeholder_hash_1'),
    ('550e8400-e29b-41d4-a716-446655440002', 'owner2@example.com', '$2a$12$placeholder_hash_2')
ON CONFLICT (email) DO NOTHING;

INSERT INTO businesses (id, owner_id, name, category, description, contact, location, coordinates, hours, images, rating, tags, offers, votes) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Sunset Beach Bar & Grill',
        'Beach Bar',
        'Authentic local cuisine with stunning sunset views over the Caribbean Sea.',
        '{"phone": "+1-758-456-7890", "email": "info@sunsetbeach.lc", "website": "https://sunsetbeach.lc"}',
        'Reduit Beach, Rodney Bay',
        '{"lat": 14.0719, "lng": -60.9506}',
        '{"Monday": "11:00 AM - 10:00 PM", "Tuesday": "11:00 AM - 10:00 PM", "Wednesday": "11:00 AM - 10:00 PM", "Thursday": "11:00 AM - 10:00 PM", "Friday": "11:00 AM - 11:00 PM", "Saturday": "10:00 AM - 11:00 PM", "Sunday": "10:00 AM - 10:00 PM"}',
        '["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"]',
        4.5,
        '["seafood", "local cuisine", "sunset views", "beachfront"]',
        'Happy Hour 4-6 PM daily',
        15
    ),
    (
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440002',
        'Island Spice Market',
        'Shop',
        'Local spices, crafts, and souvenirs showcasing the best of St. Lucia.',
        '{"phone": "+1-758-456-7891", "email": "info@islandspice.lc"}',
        'Castries Central Market',
        '{"lat": 14.0101, "lng": -60.9874}',
        '{"Monday": "8:00 AM - 5:00 PM", "Tuesday": "8:00 AM - 5:00 PM", "Wednesday": "8:00 AM - 5:00 PM", "Thursday": "8:00 AM - 5:00 PM", "Friday": "8:00 AM - 5:00 PM", "Saturday": "8:00 AM - 3:00 PM", "Sunday": "Closed"}',
        '["https://picsum.photos/400/300?random=3"]',
        4.2,
        '["spices", "crafts", "souvenirs", "local products"]',
        '10% discount for locals',
        8
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, date, time, description, business_id, image) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440005',
        'Friday Night Street Party',
        CURRENT_DATE + INTERVAL '1 week',
        '19:00:00',
        'Live music, local food vendors, and dancing in the streets of Gros Islet.',
        '550e8400-e29b-41d4-a716-446655440003',
        'https://picsum.photos/400/300?random=event1'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440006',
        'Spice & Culture Workshop',
        CURRENT_DATE + INTERVAL '2 weeks',
        '14:00:00',
        'Learn about local spices and their traditional uses in Caribbean cooking.',
        '550e8400-e29b-41d4-a716-446655440004',
        'https://picsum.photos/400/300?random=event2'
    )
ON CONFLICT (id) DO NOTHING;
