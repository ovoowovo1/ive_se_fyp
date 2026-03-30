SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS react_fyp_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE react_fyp_demo;

DROP VIEW IF EXISTS item_classification_attribute;

DROP TABLE IF EXISTS ai_image_result_photo;
DROP TABLE IF EXISTS ai_image_result;
DROP TABLE IF EXISTS ai_text_result;
DROP TABLE IF EXISTS ai_image_setting;
DROP TABLE IF EXISTS ai_text_setting;
DROP TABLE IF EXISTS ai;
DROP TABLE IF EXISTS human_report;
DROP TABLE IF EXISTS user_request_progress;
DROP TABLE IF EXISTS user_request;
DROP TABLE IF EXISTS user_browse;
DROP TABLE IF EXISTS user_search_record;
DROP TABLE IF EXISTS user_collect;
DROP TABLE IF EXISTS user_free_time;
DROP TABLE IF EXISTS donate_photos;
DROP TABLE IF EXISTS user_donate_item_details;
DROP TABLE IF EXISTS user_donate_item;
DROP TABLE IF EXISTS item_attribute_checkboxorradiobtn;
DROP TABLE IF EXISTS item_classificationattribute;
DROP TABLE IF EXISTS item_attribute;
DROP TABLE IF EXISTS item_classification;
DROP TABLE IF EXISTS announcement;
DROP TABLE IF EXISTS admin_permission;
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS user;

CREATE TABLE admin (
  Admin_ID VARCHAR(50) NOT NULL,
  Admin_Password VARCHAR(255) NOT NULL,
  Admin_Name VARCHAR(100) NOT NULL,
  Admin_Contact_Number VARCHAR(20) DEFAULT NULL,
  Admin_Email VARCHAR(191) DEFAULT NULL,
  Admin_Job_Title VARCHAR(100) DEFAULT NULL,
  Admin_Create_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Admin_Photo VARCHAR(255) DEFAULT NULL,
  Admin_Suspended TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Last_Logout DATETIME DEFAULT NULL,
  PRIMARY KEY (Admin_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_permission (
  Admin_Permission_ID VARCHAR(50) NOT NULL,
  Admin_Permission_User TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Permission_Admin TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Permission_Analysis TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Permission_Donate TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Permission_Announcement TINYINT(1) NOT NULL DEFAULT 0,
  Admin_Permission_Violation TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (Admin_Permission_ID),
  CONSTRAINT fk_admin_permission_admin
    FOREIGN KEY (Admin_Permission_ID) REFERENCES admin (Admin_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user (
  ID VARCHAR(50) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  is_suspended TINYINT(1) NOT NULL DEFAULT 0,
  password VARCHAR(255) NOT NULL,
  User_Create_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  User_Location VARCHAR(100) DEFAULT NULL,
  User_Email VARCHAR(191) DEFAULT NULL,
  User_Contact_Number VARCHAR(20) DEFAULT NULL,
  User_image VARCHAR(255) DEFAULT NULL,
  User_AboutMe TEXT,
  User_Birthday DATE DEFAULT NULL,
  User_Gender VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (ID),
  KEY idx_user_create_date (User_Create_Date),
  KEY idx_user_email (User_Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcement (
  Announcement_ID INT NOT NULL AUTO_INCREMENT,
  Announcement_AdminID VARCHAR(50) DEFAULT NULL,
  Announcement_Image VARCHAR(255) DEFAULT NULL,
  Announcement_Title VARCHAR(255) NOT NULL,
  Announcement_Content TEXT NOT NULL,
  Announcement_DateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Announcement_On_Shelf_Status TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (Announcement_ID),
  KEY idx_announcement_shelf (Announcement_On_Shelf_Status),
  KEY idx_announcement_datetime (Announcement_DateTime),
  CONSTRAINT fk_announcement_admin
    FOREIGN KEY (Announcement_AdminID) REFERENCES admin (Admin_ID)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_classification (
  classification_ID INT NOT NULL AUTO_INCREMENT,
  classification_Name VARCHAR(100) NOT NULL,
  PRIMARY KEY (classification_ID),
  UNIQUE KEY uk_item_classification_name (classification_Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_attribute (
  Attribute_ID INT NOT NULL AUTO_INCREMENT,
  Attribute_Name VARCHAR(100) NOT NULL,
  Attribute_Type VARCHAR(50) NOT NULL,
  Attribute_DataType VARCHAR(50) NOT NULL,
  Attribute_Length INT DEFAULT NULL,
  PRIMARY KEY (Attribute_ID),
  UNIQUE KEY uk_item_attribute_name (Attribute_Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_attribute_checkboxorradiobtn (
  ID INT NOT NULL AUTO_INCREMENT,
  item_attribute_ID INT NOT NULL,
  item_Option VARCHAR(100) NOT NULL,
  PRIMARY KEY (ID),
  KEY idx_item_attribute_option_attribute (item_attribute_ID),
  CONSTRAINT fk_item_attribute_option_attribute
    FOREIGN KEY (item_attribute_ID) REFERENCES item_attribute (Attribute_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_classificationattribute (
  ID INT NOT NULL AUTO_INCREMENT,
  classification_ID INT NOT NULL,
  Attribute_ID INT NOT NULL,
  PRIMARY KEY (ID),
  UNIQUE KEY uk_item_classification_attribute (classification_ID, Attribute_ID),
  KEY idx_item_classificationattribute_attribute (Attribute_ID),
  CONSTRAINT fk_item_classificationattribute_classification
    FOREIGN KEY (classification_ID) REFERENCES item_classification (classification_ID)
    ON DELETE CASCADE,
  CONSTRAINT fk_item_classificationattribute_attribute
    FOREIGN KEY (Attribute_ID) REFERENCES item_attribute (Attribute_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE VIEW item_classification_attribute AS
SELECT ID, classification_ID, Attribute_ID
FROM item_classificationattribute;

CREATE TABLE user_donate_item (
  Donate_Item_ID INT NOT NULL AUTO_INCREMENT,
  Donate_Item_Name VARCHAR(150) NOT NULL,
  Donate_Item_type VARCHAR(100) NOT NULL,
  Donate_User_ID VARCHAR(50) NOT NULL,
  Donate_Item_Post_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Donate_Item_Status VARCHAR(50) NOT NULL,
  Donate_Status VARCHAR(50) NOT NULL DEFAULT 'Available',
  Donate_Item_Violation TINYINT(1) NOT NULL DEFAULT 0,
  Donate_Item_Describe TEXT,
  Donate_Item_Location VARCHAR(255) DEFAULT NULL,
  Donate_Item_Meetup CHAR(1) NOT NULL DEFAULT 'F',
  Donate_Item_MailingDelivery CHAR(1) NOT NULL DEFAULT 'F',
  Donate_Item_MeetupLocation VARCHAR(255) DEFAULT NULL,
  Donate_Item_MailingDeliveryMethod VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (Donate_Item_ID),
  KEY idx_user_donate_item_user (Donate_User_ID),
  KEY idx_user_donate_item_type (Donate_Item_type),
  KEY idx_user_donate_item_status (Donate_Status),
  CONSTRAINT fk_user_donate_item_user
    FOREIGN KEY (Donate_User_ID) REFERENCES user (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_donate_item_details (
  Item_details_ID INT NOT NULL,
  Bottle_Material VARCHAR(50) DEFAULT NULL,
  Bottle_Size_ML INT DEFAULT NULL,
  Suitable_Age_Months VARCHAR(30) DEFAULT NULL,
  Stroller_Type VARCHAR(50) DEFAULT NULL,
  Weight_Capacity_KG INT DEFAULT NULL,
  Foldable VARCHAR(10) DEFAULT NULL,
  Crib_Material VARCHAR(50) DEFAULT NULL,
  Mattress_Included VARCHAR(10) DEFAULT NULL,
  Clothing_Size VARCHAR(30) DEFAULT NULL,
  Season VARCHAR(30) DEFAULT NULL,
  Diaper_Size VARCHAR(20) DEFAULT NULL,
  Package_Count INT DEFAULT NULL,
  Brand VARCHAR(80) DEFAULT NULL,
  Expiry_Date DATE DEFAULT NULL,
  Condition_Note VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (Item_details_ID),
  CONSTRAINT fk_user_donate_item_details_item
    FOREIGN KEY (Item_details_ID) REFERENCES user_donate_item (Donate_Item_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE donate_photos (
  Donate_Item_ID INT NOT NULL,
  Donate_Photo_ID INT NOT NULL,
  Donate_Photo VARCHAR(255) NOT NULL,
  PRIMARY KEY (Donate_Item_ID, Donate_Photo_ID),
  KEY idx_donate_photos_path (Donate_Photo),
  CONSTRAINT fk_donate_photos_item
    FOREIGN KEY (Donate_Item_ID) REFERENCES user_donate_item (Donate_Item_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_free_time (
  ID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) NOT NULL,
  Free_Time_Start DATETIME NOT NULL,
  Free_Time_End DATETIME NOT NULL,
  Remark VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (ID),
  KEY idx_user_free_time_user (User_ID),
  CONSTRAINT fk_user_free_time_user
    FOREIGN KEY (User_ID) REFERENCES user (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_collect (
  User_collectID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) NOT NULL,
  Donate_ID INT NOT NULL,
  PRIMARY KEY (User_collectID),
  UNIQUE KEY uk_user_collect_user_item (User_ID, Donate_ID),
  KEY idx_user_collect_donate (Donate_ID),
  CONSTRAINT fk_user_collect_user
    FOREIGN KEY (User_ID) REFERENCES user (ID)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_collect_donate
    FOREIGN KEY (Donate_ID) REFERENCES user_donate_item (Donate_Item_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_search_record (
  ID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) NOT NULL,
  Search_content VARCHAR(255) NOT NULL,
  Search_DateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  KEY idx_user_search_record_user (User_ID),
  KEY idx_user_search_record_datetime (Search_DateTime),
  CONSTRAINT fk_user_search_record_user
    FOREIGN KEY (User_ID) REFERENCES user (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_browse (
  ID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) NOT NULL,
  Donation_Item_ID INT NOT NULL,
  Browse_Time INT NOT NULL DEFAULT 0,
  Browse_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  KEY idx_user_browse_user (User_ID),
  KEY idx_user_browse_item (Donation_Item_ID),
  CONSTRAINT fk_user_browse_user
    FOREIGN KEY (User_ID) REFERENCES user (ID)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_browse_item
    FOREIGN KEY (Donation_Item_ID) REFERENCES user_donate_item (Donate_Item_ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_request (
  Request_ID VARCHAR(50) NOT NULL,
  Request_User_ID VARCHAR(50) NOT NULL,
  Baby_age VARCHAR(50) NOT NULL,
  Gender VARCHAR(20) NOT NULL,
  Item_type VARCHAR(100) NOT NULL,
  Expect_quantity INT NOT NULL,
  Donated_quantity INT NOT NULL DEFAULT 0,
  Size_or_range VARCHAR(100) NOT NULL,
  Urgency VARCHAR(50) NOT NULL,
  Reason_of_Request TEXT NOT NULL,
  Additional_Note TEXT NOT NULL,
  Request_Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  Request_Post_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  matchID VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (Request_ID),
  KEY idx_user_request_user (Request_User_ID),
  KEY idx_user_request_item_type (Item_type),
  KEY idx_user_request_status (Request_Status),
  CONSTRAINT fk_user_request_user
    FOREIGN KEY (Request_User_ID) REFERENCES user (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_request_progress (
  Request_Donated_ID VARCHAR(50) NOT NULL,
  Request_ID VARCHAR(50) NOT NULL,
  Item_type VARCHAR(100) NOT NULL,
  Request_User_ID VARCHAR(50) NOT NULL,
  Donator_ID VARCHAR(50) NOT NULL,
  Expect_quantity INT NOT NULL,
  Donated_quantity INT NOT NULL,
  Request_Post_Date DATETIME NOT NULL,
  Donated_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Donated_Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (Request_Donated_ID),
  KEY idx_user_request_progress_request (Request_ID),
  KEY idx_user_request_progress_user (Request_User_ID),
  KEY idx_user_request_progress_donator (Donator_ID),
  CONSTRAINT fk_user_request_progress_request
    FOREIGN KEY (Request_ID) REFERENCES user_request (Request_ID)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_request_progress_request_user
    FOREIGN KEY (Request_User_ID) REFERENCES user (ID)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_request_progress_donator
    FOREIGN KEY (Donator_ID) REFERENCES user (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comment` (
  Comment_ID INT NOT NULL AUTO_INCREMENT,
  DonateID VARCHAR(50) NOT NULL,
  Type VARCHAR(50) NOT NULL,
  SenderID VARCHAR(50) NOT NULL,
  ReceiverID VARCHAR(50) NOT NULL,
  CommentText TEXT NOT NULL,
  Rating DECIMAL(3,1) NOT NULL,
  CommentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Comment_ID),
  KEY idx_comment_sender (SenderID),
  KEY idx_comment_receiver (ReceiverID),
  KEY idx_comment_donate (DonateID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE human_report (
  Report_ID INT NOT NULL AUTO_INCREMENT,
  Report_User_ID VARCHAR(50) DEFAULT NULL,
  Report_Admin_ID VARCHAR(50) DEFAULT NULL,
  Report_Type VARCHAR(50) NOT NULL,
  Report_Content TEXT NOT NULL,
  Report_Reporter_ID VARCHAR(50) DEFAULT NULL,
  Report_Donation_Item_ID INT DEFAULT NULL,
  Report_Handle TINYINT(1) NOT NULL DEFAULT 0,
  Report_Processing_DateTime DATETIME DEFAULT NULL,
  Report_Processed_DateTime DATETIME DEFAULT NULL,
  Report_Case_Outcome TEXT,
  PRIMARY KEY (Report_ID),
  KEY idx_human_report_user (Report_User_ID),
  KEY idx_human_report_admin (Report_Admin_ID),
  KEY idx_human_report_item (Report_Donation_Item_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai (
  ID INT NOT NULL AUTO_INCREMENT,
  User_Message TEXT NOT NULL,
  AI_Message TEXT NOT NULL,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_text_setting (
  ID VARCHAR(20) NOT NULL,
  open VARCHAR(1) NOT NULL DEFAULT '1',
  judgement INT NOT NULL DEFAULT 2,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_image_setting (
  ID VARCHAR(20) NOT NULL,
  open VARCHAR(1) NOT NULL DEFAULT '1',
  judgement INT NOT NULL DEFAULT 2,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_text_result (
  ID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) DEFAULT NULL,
  Text_Content TEXT,
  Text_Hate INT DEFAULT NULL,
  Text_SelfHarm INT DEFAULT NULL,
  Text_Sexual INT DEFAULT NULL,
  Text_Violence INT DEFAULT NULL,
  Block TINYINT(1) NOT NULL DEFAULT 0,
  Checktime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  KEY idx_ai_text_result_user (User_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_image_result (
  ID INT NOT NULL AUTO_INCREMENT,
  User_ID VARCHAR(50) DEFAULT NULL,
  Checktime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  KEY idx_ai_image_result_user (User_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_image_result_photo (
  Photo_ID INT NOT NULL AUTO_INCREMENT,
  ID INT NOT NULL,
  Photo_Path VARCHAR(255) NOT NULL,
  Image_Hate INT DEFAULT NULL,
  Image_SelfHarm INT DEFAULT NULL,
  Image_Sexual INT DEFAULT NULL,
  Image_Violence INT DEFAULT NULL,
  Block TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (Photo_ID),
  KEY idx_ai_image_result_photo_result (ID),
  CONSTRAINT fk_ai_image_result_photo_result
    FOREIGN KEY (ID) REFERENCES ai_image_result (ID)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
