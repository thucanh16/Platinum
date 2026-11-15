-- Chạy trong database platinum_local. npm run setup tự áp dụng file này.
CREATE TABLE IF NOT EXISTS admins (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(80) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS company_info (
 id INT PRIMARY KEY,
 payload JSON NOT NULL,
 revision INT UNSIGNED NOT NULL DEFAULT 1,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS content_items (
 id VARCHAR(100) PRIMARY KEY,
 group_key VARCHAR(40) NOT NULL,
 title VARCHAR(200) NOT NULL,
 description TEXT NOT NULL,
 tag VARCHAR(100) NOT NULL,
 details TEXT NOT NULL,
 image_path VARCHAR(255) NOT NULL DEFAULT '',
 sort_order INT NOT NULL DEFAULT 0,
 INDEX items_group_order (group_key,sort_order)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS consultation_requests (
 id CHAR(36) PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 contact VARCHAR(200) NOT NULL,
 message TEXT NOT NULL,
 status ENUM('new','contacted','done') NOT NULL DEFAULT 'new',
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX requests_created_at (created_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessions (
 session_id VARCHAR(128) PRIMARY KEY,
 data JSON NOT NULL,
 expires_at BIGINT NOT NULL,
 INDEX sessions_expiry (expires_at)
) ENGINE=InnoDB;
