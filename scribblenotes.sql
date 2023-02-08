SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `scribblenotes`
--
-- Update datatypes for production
--

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS notes;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  user_id int NOT NULL AUTO_INCREMENT,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits int DEFAULT 0,
  stripe_cust_id VARCHAR(128),
  subscription VARCHAR(16) DEFAULT 'none',
  is_admin BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS notes (
  note_id int NOT NULL AUTO_INCREMENT,
  name VARCHAR(32),
  filename VARCHAR(255),
  user_id int NOT NULL,
  note_status VARCHAR(32),
  PRIMARY KEY (note_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id int NOT NULL AUTO_INCREMENT,
  name VARCHAR(32),
  filename VARCHAR(255),
  user_id int NOT NULL,
  campaign_status VARCHAR(32),
  PRIMARY KEY (campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)

CREATE TABLE IF NOT EXISTS reset_password (
  uuid VARCHAR(128) NOT NULL,
  user_id int NOT NULL,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (uuid),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)

CREATE TABLE IF NOT EXISTS notifications (
  notification_id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  message VARCHAR(64),
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)
