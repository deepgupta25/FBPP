-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    profile_image_url VARCHAR(255)
);

-- Partners Table
CREATE TABLE partners (
    partner_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('Gold', 'Silver', 'Bronze')),
    description TEXT,
    website VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Roles Table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Insert standard roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'System-wide administrative access'),
('partner_admin', 'Administrative access to a specific partner'),
('partner_user', 'Standard user access within a partner organization');

-- User Roles (Junction Table)
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(user_id),
    role_id INTEGER REFERENCES roles(role_id),
    partner_id INTEGER REFERENCES partners(partner_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(user_id),
    PRIMARY KEY (user_id, role_id, partner_id)
);

-- Permissions Table
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Insert standard permissions
INSERT INTO permissions (name, description) VALUES
('manage_partners', 'Create, update, and delete partner organizations'),
('view_all_partners', 'View all partner organizations'),
('manage_users', 'Create, update, and delete users'),
('manage_team', 'Create, update, and delete team members within a partner'),
('view_all_deals', 'View all deals across all partners'),
('manage_deals', 'Create, update, and delete deals'),
('view_own_deals', 'View only own deals'),
('manage_leads', 'Create, update, and delete leads'),
('view_own_leads', 'View only own leads'),
('manage_resources', 'Create, update, and delete resources'),
('view_resources', 'View and download resources'),
('view_analytics', 'View analytics and reports'),
('manage_rewards', 'Manage rewards and vouchers'),
('view_own_rewards', 'View own rewards and vouchers');

-- Role Permissions (Junction Table)
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(role_id),
    permission_id INTEGER REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

-- Assign permissions to roles
-- Super Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT role_id FROM roles WHERE name = 'super_admin'), permission_id
FROM permissions;

-- Partner Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT role_id FROM roles WHERE name = 'partner_admin'), permission_id
FROM permissions
WHERE name IN (
    'manage_team', 'manage_deals', 'view_all_deals', 'manage_leads', 
    'view_resources', 'manage_resources', 'view_analytics', 'manage_rewards'
);

-- Partner User permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT role_id FROM roles WHERE name = 'partner_user'), permission_id
FROM permissions
WHERE name IN (
    'view_own_deals', 'manage_deals', 'view_own_leads', 'manage_leads', 
    'view_resources', 'view_own_rewards'
);

-- Deals Table
CREATE TABLE deals (
    deal_id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(partner_id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    value DECIMAL(12,2),
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to INTEGER REFERENCES users(user_id),
    created_by INTEGER REFERENCES users(user_id)
);

-- Leads Table
CREATE TABLE leads (
    lead_id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(partner_id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    company VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Unqualified')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to INTEGER REFERENCES users(user_id),
    created_by INTEGER REFERENCES users(user_id),
    converted_to_deal INTEGER REFERENCES deals(deal_id)
);

-- Resources Table
CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    category VARCHAR(100),
    visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('all', 'gold', 'silver', 'bronze', 'admin_only')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id)
);

-- Rewards Table
CREATE TABLE rewards (
    reward_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    amount DECIMAL(12,2) NOT NULL,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('voucher', 'bonus', 'commission')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('issued', 'claimed', 'expired')),
    issued_for VARCHAR(100) NOT NULL,
    deal_id INTEGER REFERENCES deals(deal_id),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    claimed_at TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Announcements Table
CREATE TABLE announcements (
    announcement_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('all', 'gold', 'silver', 'bronze', 'admin_only')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id)
);
