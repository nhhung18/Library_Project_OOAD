CREATE DATABASE ooda_g3
USE ooda_g3
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(255) UNIQUE NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone_num` VARCHAR(20),
  `role_id` INT NOT NULL,
  `avatar_url` VARCHAR(255),
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);
alter table users add column address varchar(255)
select * from users

CREATE TABLE `roles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `role_name` ENUM ('ADMIN', 'LIBRARIAN', 'STAFF', 'GUEST') NOT NULL
);

CREATE TABLE `work_shifts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `shift_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `created_at` TIMESTAMP,
  `updated_at` TIMESTAMP
);

CREATE TABLE `staff_shifts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `staff_id` INT NOT NULL,
  `shift_id` INT NOT NULL,
  `shift_date` DATE NOT NULL
);

CREATE TABLE `attendance` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `staff_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `status` ENUM ('PRESENT', 'ABSENT', 'LATE') NOT NULL,
  `check_in_time` TIMESTAMP,
  `check_out_time` TIMESTAMP,
  `note` TEXT,
  `created_at` TIMESTAMP
);

CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_name` VARCHAR(255) NOT NULL
);

CREATE TABLE `books` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `isbn` VARCHAR(50) UNIQUE NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255),
  `publisher` VARCHAR(255),
  `publish_year` YEAR,
  `category_id` INT NOT NULL,
  `total_copies` INT DEFAULT 1,
  `available_copies` INT DEFAULT 1,
  `description` TEXT,
  `image_url` VARCHAR(255)
);

CREATE TABLE `borrow_records` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `borrow_date` DATETIME,
  `due_date` DATETIME NOT NULL,
  `return_date` DATETIME,
  `status` ENUM ('BORROWED', 'RETURNED', 'OVERDUE') DEFAULT 'BORROWED',
  `note` TEXT,
  `created_at` TIMESTAMP
);

CREATE UNIQUE INDEX `staff_shifts_index_0` ON `staff_shifts` (`staff_id`, `shift_id`, `shift_date`);

CREATE UNIQUE INDEX `attendance_index_1` ON `attendance` (`staff_id`, `attendance_date`);

ALTER TABLE `users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `books` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `staff_shifts` ADD FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`);

ALTER TABLE `staff_shifts` ADD FOREIGN KEY (`shift_id`) REFERENCES `work_shifts` (`id`);

ALTER TABLE `attendance` ADD FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`);

ALTER TABLE `borrow_records` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `borrow_records` ADD FOREIGN KEY (`book_id`) REFERENCES `books` (`id`);


-- Roles
INSERT INTO roles (role_name) VALUES 
('ADMIN'), ('LIBRARIAN'), ('STAFF');

-- Users
INSERT INTO users (username, full_name, email, password, phone_num, role_id, avatar_url)
VALUES
('admin001', 'Nguyen Van A', 'admin@example.com', '123456', '0901000001', 1, NULL),
('lib001', 'Tran Thi B', 'library@example.com', '123456', '0902000002', 2, NULL),
('staff001', 'Le Van C', 'staff@example.com', '123456', '0903000003', 3, NULL);

-- Work Shifts
INSERT INTO work_shifts (shift_name, start_time, end_time)
VALUES
('Ca Sáng', '07:30:00', '11:30:00'),
('Ca Chiều', '13:00:00', '17:00:00'),
('Ca Tối', '17:30:00', '21:00:00');

-- Staff Shifts
INSERT INTO staff_shifts (staff_id, shift_id, shift_date)
VALUES
(3, 1, '2025-11-29'),
(3, 2, '2025-11-30');

-- Attendance
INSERT INTO attendance (staff_id, attendance_date, status, check_in_time, check_out_time, note)
VALUES
(3, '2025-11-29', 'PRESENT', '2025-11-29 07:35:00', '2025-11-29 11:28:00', 'Đi làm đúng ca');

-- Categories
INSERT INTO categories (category_name) VALUES
('Khoa học'), ('Văn học'), ('Công nghệ'), ('Thiếu nhi');

-- Books
INSERT INTO books (isbn, title, author, publisher, publish_year, category_id, total_copies, available_copies)
VALUES
('9786041234567', 'Lập Trình Python Cơ Bản', 'Nguyen Hung', 'NXB Trẻ', 2022, 3, 10, 7),
('9786049876543', 'Văn Học Việt Nam', 'To Hoai', 'NXB Kim Đồng', 2019, 2, 5, 5),
('9786043456789', 'Khoa Học Vũ Trụ', 'Stephen Hawking', 'NXB Giáo Dục', 2018, 1, 3, 2);

-- Borrow Records
INSERT INTO borrow_records (user_id, book_id, due_date, status)
VALUES
(2, 1, '2025-12-10', 'BORROWED'),
(2, 3, '2025-12-15', 'BORROWED');