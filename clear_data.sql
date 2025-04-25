-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data from all tables
TRUNCATE TABLE enrollments;
TRUNCATE TABLE courses;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
TRUNCATE TABLE roles;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1; 