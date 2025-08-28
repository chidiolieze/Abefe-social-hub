-- Insert some initial products for testing
INSERT INTO products (id, name, description, price, category, stock, image_url) VALUES
('fb-usa-pure-001', 'Facebook USA Account - Pure', 'High-quality Facebook account from USA with verified email and phone', 2500, 'facebook', 50, '/placeholder.svg?height=200&width=200'),
('ig-usa-aged-001', 'Instagram USA Account - Aged', 'Aged Instagram account from USA with good engagement history', 3000, 'instagram', 30, '/placeholder.svg?height=200&width=200'),
('tw-global-verified-001', 'Twitter Global Account - Verified', 'Global Twitter account with verification badge', 5000, 'twitter', 20, '/placeholder.svg?height=200&width=200'),
('tiktok-usa-creator-001', 'TikTok USA Creator Account', 'TikTok creator account from USA with follower base', 4000, 'tiktok', 25, '/placeholder.svg?height=200&width=200'),
('linkedin-premium-001', 'LinkedIn Premium Account', 'LinkedIn Premium account with professional network', 6000, 'linkedin', 15, '/placeholder.svg?height=200&width=200');

-- Insert product credentials for testing
INSERT INTO product_credentials (product_id, username, password) VALUES
('fb-usa-pure-001', 'fbuser001@gmail.com', 'SecurePass123!'),
('fb-usa-pure-001', 'fbuser002@gmail.com', 'SecurePass456!'),
('fb-usa-pure-001', 'fbuser003@gmail.com', 'SecurePass789!'),
('ig-usa-aged-001', 'iguser001@gmail.com', 'InstaPass123!'),
('ig-usa-aged-001', 'iguser002@gmail.com', 'InstaPass456!'),
('tw-global-verified-001', 'twuser001@gmail.com', 'TwitterPass123!'),
('tw-global-verified-001', 'twuser002@gmail.com', 'TwitterPass456!'),
('tiktok-usa-creator-001', 'tiktokuser001@gmail.com', 'TikTokPass123!'),
('linkedin-premium-001', 'linkedinuser001@gmail.com', 'LinkedInPass123!');

-- Create a test admin user (password: admin123)
INSERT INTO users (email, name, phone, password_hash, balance, is_admin, referral_code) VALUES
('admin@abefesocialhub.com', 'Admin User', '+1234567890', '$2b$10$rOvHPz8fvHRfYv2sY8UFDO9OpIXzxaVhNcLx6UJMqUPuHDxHG4F3u', 10000.00, true, 'ADMIN001');

-- Create a test regular user (password: user123)
INSERT INTO users (email, name, phone, password_hash, balance, referral_code) VALUES
('user@test.com', 'Test User', '+0987654321', '$2b$10$rOvHPz8fvHRfYv2sY8UFDO9OpIXzxaVhNcLx6UJMqUPuHDxHG4F3u', 5000.00, 'USER001');
