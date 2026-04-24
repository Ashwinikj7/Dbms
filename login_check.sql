-- ============================================
-- ADMIN AUTHENTICATION SETUP
-- Fixed default Admin login system
-- ============================================

-- Create admins_auth table if not already existing
CREATE TABLE IF NOT EXISTS admins_auth (
    admin_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Clear existing admin records and insert fixed admin
DELETE FROM admins_auth;

-- Insert the single fixed Admin record
-- Admin ID: ADMIN243
-- Password: admin@243
INSERT INTO admins_auth (
    admin_id,
    full_name,
    email,
    phone,
    password
)
VALUES (
    'ADMIN243',
    'System Administrator',
    'admin@pulseofhope.com',
    '9999999999',
    'admin@243'
);

-- ============================================
-- LOGIN CREDENTIAL VERIFICATION QUERIES
-- ============================================

-- Check admin credentials (using safe pattern - no .single())
SELECT admin_id, full_name, email, phone
FROM admins_auth
WHERE admin_id = 'ADMIN243' 
  AND password = 'admin@243';

-- ============================================
-- OTHER ROLE LOGIN VERIFICATION QUERIES
-- ============================================

SELECT doctor_id, full_name, hospital_name, specialization, email, phone, city
FROM doctors_auth
WHERE doctor_id = 'DOC001' 
  AND password = 'doctor123';

SELECT aadhar_number, full_name, age, phone, email, blood_group, hospital_name, city, urgency
FROM patients_auth
WHERE aadhar_number = '123456789012';

SELECT aadhar_number, full_name, age, email, phone, blood_group, city
FROM donors_auth
WHERE aadhar_number = '987654321012' 
  AND password = 'donor123';

-- ============================================
-- LOGIN HISTORY LOGGING
-- ============================================

-- Log doctor login
INSERT INTO login_history (role, user_identifier)
VALUES ('doctor', 'DOC001');

-- Log patient login
INSERT INTO login_history (role, user_identifier)
VALUES ('patient', '123456789012');

-- Log donor login
INSERT INTO login_history (role, user_identifier)
VALUES ('donor', '987654321012');

-- Log admin login
INSERT INTO login_history (role, user_identifier)
VALUES ('admin', 'ADMIN243');

-- ============================================
-- LOGIN HISTORY VIEWS
-- ============================================

-- View all recent logins (last 50)
SELECT 
    login_id,
    role,
    user_identifier,
    login_time
FROM login_history
ORDER BY login_time DESC
LIMIT 50;

-- View logins by role
SELECT 
    role,
    COUNT(*) as total_logins,
    MAX(login_time) as last_login
FROM login_history
GROUP BY role
ORDER BY total_logins DESC;

-- View logins for a specific user
SELECT 
    login_id,
    role,
    user_identifier,
    login_time
FROM login_history
WHERE user_identifier = 'ADMIN243'
ORDER BY login_time DESC
LIMIT 10;

-- ============================================
-- USER LOOKUP QUERIES
-- ============================================

-- Find doctor by email
SELECT doctor_id, full_name, hospital_name, city
FROM doctors_auth
WHERE email = 'doctor@hospital.com';

-- Find patient by phone
SELECT aadhar_number, full_name, age, blood_group, city
FROM patients_auth
WHERE phone = '9876543210';

-- Find donor by email
SELECT aadhar_number, full_name, blood_group, city, phone
FROM donors_auth
WHERE email = 'donor@email.com';

-- Find admin by email
SELECT admin_id, phone
FROM admins_auth
WHERE email = 'admin@pulseofhope.com';

-- ============================================
-- VALIDATION QUERIES
-- ============================================

-- Check if doctor_id already exists
SELECT COUNT(*) as count
FROM doctors_auth
WHERE doctor_id = 'DOC001';

-- Check if aadhar_number exists in patients
SELECT COUNT(*) as count
FROM patients_auth
WHERE aadhar_number = '123456789012';

-- Check if aadhar_number exists in donors
SELECT COUNT(*) as count
FROM donors_auth
WHERE aadhar_number = '987654321012';

-- Check if admin_id already exists
SELECT COUNT(*) as count
FROM admins_auth
WHERE admin_id = 'ADMIN243';

-- ============================================
-- DASHBOARD QUERIES
-- ============================================

-- Total users by role
SELECT 'Doctors' as role, COUNT(*) as total FROM doctors_auth
UNION ALL
SELECT 'Patients' as role, COUNT(*) as total FROM patients_auth
UNION ALL
SELECT 'Donors' as role, COUNT(*) as total FROM donors_auth
UNION ALL
SELECT 'Admins' as role, COUNT(*) as total FROM admins_auth;

-- Recent registrations (last 7 days)
SELECT 
    'Doctor' as role,
    COUNT(*) as new_users
FROM doctors_auth
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'Patient' as role,
    COUNT(*) as new_users
FROM patients_auth
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'Donor' as role,
    COUNT(*) as new_users
FROM donors_auth
WHERE created_at >= NOW() - INTERVAL '7 days';

-- ============================================
-- SECURITY QUERIES
-- ============================================

-- Check for accounts with weak passwords
SELECT doctor_id, email
FROM doctors_auth
WHERE LENGTH(password) < 8;

SELECT aadhar_number, email
FROM donors_auth
WHERE LENGTH(password) < 8;