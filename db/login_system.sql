CREATE DATABASE login_system;
USE login_system;
CREATE TABLE users (
    user_id SMALLINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);