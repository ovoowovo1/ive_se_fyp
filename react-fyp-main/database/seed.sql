USE react_fyp_demo;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO admin (
  Admin_ID,
  Admin_Password,
  Admin_Name,
  Admin_Contact_Number,
  Admin_Email,
  Admin_Job_Title,
  Admin_Create_Date,
  Admin_Photo,
  Admin_Suspended,
  Admin_Last_Logout
) VALUES
  (
    'root',
    '$2b$10$0onrCdKszoSLYro7RGqZNeCF0w3wL/A82.3CeE2iwa7GrXAC.w3CW',
    'Root Admin',
    '91234567',
    'root@reactfyp.demo',
    'Super Admin',
    '2026-03-01 09:00:00',
    'uploadAdminIMG/75860cfbdc3316836b787768d7d7370f',
    0,
    '2026-03-29 18:30:00'
  ),
  (
    'admin01',
    '$2b$10$0onrCdKszoSLYro7RGqZNeCF0w3wL/A82.3CeE2iwa7GrXAC.w3CW',
    'May Chan',
    '92345678',
    'admin01@reactfyp.demo',
    'Admin',
    '2026-03-05 10:30:00',
    'uploadAdminIMG/d53dd19601101764bb3051b25ebdfd47',
    0,
    '2026-03-29 20:15:00'
  );

INSERT INTO admin_permission (
  Admin_Permission_ID,
  Admin_Permission_User,
  Admin_Permission_Admin,
  Admin_Permission_Analysis,
  Admin_Permission_Donate,
  Admin_Permission_Announcement,
  Admin_Permission_Violation
) VALUES
  ('root', 1, 1, 1, 1, 1, 1),
  ('admin01', 1, 1, 1, 1, 1, 1);

INSERT INTO user (
  ID,
  Name,
  is_suspended,
  password,
  User_Create_Date,
  User_Location,
  User_Email,
  User_Contact_Number,
  User_image,
  User_AboutMe,
  User_Birthday,
  User_Gender
) VALUES
  (
    'user01',
    'Emma Chan',
    0,
    '$2b$10$mtHmlduhw36iR6.F.gr9ge0KDFZYnmtWKwMMSxRsj5Uz.gUaiNtg.',
    '2026-02-20 11:00:00',
    'China(Hong Kong)',
    'emma@reactfyp.demo',
    '61112222',
    'uploads/3ed104e94bc256052e869841af2e6c2b',
    'First-time mother looking to share lightly used baby items.',
    '1996-08-15',
    'Female'
  ),
  (
    'user02',
    'Jason Lee',
    0,
    '$2b$10$mtHmlduhw36iR6.F.gr9ge0KDFZYnmtWKwMMSxRsj5Uz.gUaiNtg.',
    '2026-02-22 14:20:00',
    'China(Hong Kong)',
    'jason@reactfyp.demo',
    '62223333',
    'uploads/51195c39acdc31abb80ecab026428315',
    'Volunteer parent who donates gear after every growth stage.',
    '1993-04-28',
    'Male'
  ),
  (
    'user03',
    'Olivia Wong',
    0,
    '$2b$10$mtHmlduhw36iR6.F.gr9ge0KDFZYnmtWKwMMSxRsj5Uz.gUaiNtg.',
    '2026-02-25 09:45:00',
    'China(Hong Kong)',
    'olivia@reactfyp.demo',
    '63334444',
    NULL,
    'Collects essentials for community redistribution.',
    '1995-01-10',
    'Female'
  ),
  (
    'user04',
    'Noah Lau',
    0,
    '$2b$10$mtHmlduhw36iR6.F.gr9ge0KDFZYnmtWKwMMSxRsj5Uz.gUaiNtg.',
    '2026-03-01 16:05:00',
    'China(Hong Kong)',
    'noah@reactfyp.demo',
    '64445555',
    NULL,
    'New parent requesting practical newborn supplies.',
    '1992-11-03',
    'Male'
  );

INSERT INTO item_classification (classification_ID, classification_Name) VALUES
  (1, 'Baby bottle'),
  (2, 'Baby stroller'),
  (3, 'Crib'),
  (4, 'Clothes'),
  (5, 'Diapers'),
  (6, 'Milk powder'),
  (7, 'Others');

INSERT INTO item_attribute (
  Attribute_ID,
  Attribute_Name,
  Attribute_Type,
  Attribute_DataType,
  Attribute_Length
) VALUES
  (1, 'Bottle_Material', 'select', 'string', 32),
  (2, 'Bottle_Size_ML', 'textbox', 'int', 4),
  (3, 'Suitable_Age_Months', 'select', 'string', 16),
  (4, 'Stroller_Type', 'select', 'string', 32),
  (5, 'Weight_Capacity_KG', 'textbox', 'int', 3),
  (6, 'Foldable', 'radiobutton', 'string', 3),
  (7, 'Crib_Material', 'select', 'string', 32),
  (8, 'Mattress_Included', 'radiobutton', 'string', 3),
  (9, 'Clothing_Size', 'select', 'string', 16),
  (10, 'Season', 'select', 'string', 16),
  (11, 'Diaper_Size', 'select', 'string', 16),
  (12, 'Package_Count', 'textbox', 'int', 4),
  (13, 'Brand', 'textbox', 'string', 80),
  (14, 'Expiry_Date', 'datepicker', 'date', NULL),
  (15, 'Condition_Note', 'textbox', 'string', 255);

INSERT INTO item_attribute_checkboxorradiobtn (ID, item_attribute_ID, item_Option) VALUES
  (1, 1, 'PPSU'),
  (2, 1, 'Glass'),
  (3, 1, 'Silicone'),
  (4, 3, '0-6'),
  (5, 3, '6-12'),
  (6, 3, '12+'),
  (7, 4, 'Compact'),
  (8, 4, 'Jogging'),
  (9, 4, 'Travel'),
  (10, 6, 'Yes'),
  (11, 6, 'No'),
  (12, 7, 'Wood'),
  (13, 7, 'Metal'),
  (14, 7, 'Mixed'),
  (15, 8, 'Yes'),
  (16, 8, 'No'),
  (17, 9, 'Newborn'),
  (18, 9, '0-3M'),
  (19, 9, '3-6M'),
  (20, 9, '6-12M'),
  (21, 9, '1-2Y'),
  (22, 10, 'Summer'),
  (23, 10, 'Winter'),
  (24, 10, 'All Season'),
  (25, 11, 'NB'),
  (26, 11, 'S'),
  (27, 11, 'M'),
  (28, 11, 'L');

INSERT INTO item_classificationattribute (ID, classification_ID, Attribute_ID) VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 1, 3),
  (4, 2, 4),
  (5, 2, 5),
  (6, 2, 6),
  (7, 3, 7),
  (8, 3, 8),
  (9, 3, 15),
  (10, 4, 9),
  (11, 4, 10),
  (12, 4, 15),
  (13, 5, 11),
  (14, 5, 12),
  (15, 5, 15),
  (16, 6, 13),
  (17, 6, 14),
  (18, 6, 15),
  (19, 7, 15);

INSERT INTO announcement (
  Announcement_ID,
  Announcement_AdminID,
  Announcement_Image,
  Announcement_Title,
  Announcement_Content,
  Announcement_DateTime,
  Announcement_On_Shelf_Status
) VALUES
  (
    1,
    'admin01',
    'uploadAnnouncement/c8806be4b145cc085142187298a9568c',
    'Spring Donation Drive',
    'We are prioritizing clean baby clothes, diapers, and feeding supplies for new families this month.',
    '2026-03-10 10:00:00',
    1
  ),
  (
    2,
    'root',
    'uploadAnnouncement/c8806be4b145cc085142187298a9568c',
    'Review Workflow Updated',
    'AI review thresholds have been tightened and human reports are now triaged twice daily.',
    '2026-03-18 15:30:00',
    1
  );

INSERT INTO user_donate_item (
  Donate_Item_ID,
  Donate_Item_Name,
  Donate_Item_type,
  Donate_User_ID,
  Donate_Item_Post_Date,
  Donate_Item_Status,
  Donate_Status,
  Donate_Item_Violation,
  Donate_Item_Describe,
  Donate_Item_Location,
  Donate_Item_Meetup,
  Donate_Item_MailingDelivery,
  Donate_Item_MeetupLocation,
  Donate_Item_MailingDeliveryMethod
) VALUES
  (
    1,
    'PPSU Bottle Starter Set',
    'Baby bottle',
    'user01',
    '2026-03-02 09:00:00',
    'Like new',
    'Available',
    0,
    'Set of four anti-colic bottles with different teat flows.',
    'HK',
    'T',
    'F',
    'Tsuen Wan MTR',
    NULL
  ),
  (
    2,
    'Travel Baby Stroller',
    'Baby stroller',
    'user02',
    '2026-03-03 11:15:00',
    'Lightly used',
    'Available',
    0,
    'Compact stroller suitable for car trunks and daily commuting.',
    'HK',
    'T',
    'T',
    'Kowloon Tong Station',
    'SF Express'
  ),
  (
    3,
    'Convertible Wooden Crib',
    'Crib',
    'user01',
    '2026-03-04 16:30:00',
    'Well used',
    'Reserved',
    0,
    'Stable crib with adjustable base height and all screws included.',
    'HK',
    'T',
    'F',
    'Tseung Kwan O',
    NULL
  ),
  (
    4,
    'Newborn Onesie Bundle',
    'Clothes',
    'user03',
    '2026-03-05 13:40:00',
    'Brand new',
    'Available',
    0,
    'Six cotton onesies washed once and never worn outside.',
    'HK',
    'F',
    'T',
    NULL,
    'Hongkong Post'
  ),
  (
    5,
    'Disposable Diaper Pack',
    'Diapers',
    'user02',
    '2026-03-06 08:25:00',
    'Brand new',
    'Available',
    0,
    'Unopened large pack of size M diapers.',
    'HK',
    'F',
    'T',
    NULL,
    'Local delivery'
  ),
  (
    6,
    'Organic Formula Tin',
    'Milk powder',
    'user04',
    '2026-03-07 18:10:00',
    'Brand new',
    'Available',
    0,
    'Sealed tin bought by mistake, suitable for babies over six months.',
    'HK',
    'T',
    'T',
    'Sha Tin',
    'SF Express'
  ),
  (
    7,
    'Ergonomic Baby Carrier',
    'Others',
    'user03',
    '2026-03-08 12:00:00',
    'Like new',
    'Available',
    0,
    'Carrier with waist support and breathable mesh fabric.',
    'HK',
    'T',
    'F',
    'Quarry Bay',
    NULL
  ),
  (
    8,
    'Jogging Stroller',
    'Baby stroller',
    'user02',
    '2026-03-12 09:30:00',
    'Well used',
    'Available',
    0,
    'Three-wheel stroller still smooth on long walks.',
    'HK',
    'T',
    'F',
    'Yuen Long',
    NULL
  );

INSERT INTO user_donate_item_details (
  Item_details_ID,
  Bottle_Material,
  Bottle_Size_ML,
  Suitable_Age_Months,
  Stroller_Type,
  Weight_Capacity_KG,
  Foldable,
  Crib_Material,
  Mattress_Included,
  Clothing_Size,
  Season,
  Diaper_Size,
  Package_Count,
  Brand,
  Expiry_Date,
  Condition_Note
) VALUES
  (1, 'PPSU', 240, '0-6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sterilized and ready to use'),
  (2, NULL, NULL, NULL, 'Travel', 22, 'Yes', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Fits cabin-size luggage'),
  (3, NULL, NULL, NULL, NULL, NULL, NULL, 'Wood', 'Yes', NULL, NULL, NULL, NULL, NULL, NULL, 'Small paint wear on one rail'),
  (4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0-3M', 'All Season', NULL, NULL, NULL, NULL, 'Soft cotton set'),
  (5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'M', 48, NULL, NULL, 'Factory sealed'),
  (6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Aptamil', '2027-06-30', 'Stored in cool and dry place'),
  (7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mesh carrier for 3-12 months'),
  (8, NULL, NULL, NULL, 'Jogging', 25, 'Yes', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brake recently replaced');

INSERT INTO donate_photos (Donate_Item_ID, Donate_Photo_ID, Donate_Photo) VALUES
  (1, 1, 'uploadDonateIMG/06a06c809961e2e0676714ca512f1e9f'),
  (2, 1, 'uploadDonateIMG/071a5ffd73dc93e300cc5a6de3424184'),
  (3, 1, 'uploadDonateIMG/0c3129399cf6a4cdce9945ecb8b75b78'),
  (4, 1, 'uploadDonateIMG/0e261309646b2bea02b13d6efd673c93'),
  (5, 1, 'uploadDonateIMG/0fe492889507d115e1a5454476d566f6'),
  (6, 1, 'uploadDonateIMG/15f76e7bc195685dfc433e21ed1dd060'),
  (7, 1, 'uploadDonateIMG/21c2cc529ecae8ea8a2f959e9065ca19'),
  (8, 1, 'uploadDonateIMG/24ba16e958f24fd2e027af0a554f06f1');

INSERT INTO user_free_time (ID, User_ID, Free_Time_Start, Free_Time_End, Remark) VALUES
  (1, 'user01', '2026-03-30 09:00:00', '2026-03-30 12:00:00', 'Morning meetup window'),
  (2, 'user02', '2026-03-31 18:00:00', '2026-03-31 20:00:00', 'After work only');

INSERT INTO user_collect (User_collectID, User_ID, Donate_ID) VALUES
  (1, 'user02', 1),
  (2, 'user03', 2),
  (3, 'user04', 5);

INSERT INTO user_search_record (ID, User_ID, Search_content, Search_DateTime) VALUES
  (1, 'user02', 'stroller', '2026-03-25 10:10:00'),
  (2, 'user04', 'formula', '2026-03-25 21:45:00');

INSERT INTO user_browse (ID, User_ID, Donation_Item_ID, Browse_Time, Browse_Date) VALUES
  (1, 'user02', 1, 74, '2026-03-25 10:12:00'),
  (2, 'user03', 2, 120, '2026-03-26 14:08:00'),
  (3, 'user04', 6, 95, '2026-03-27 20:02:00');

INSERT INTO user_request (
  Request_ID,
  Request_User_ID,
  Baby_age,
  Gender,
  Item_type,
  Expect_quantity,
  Donated_quantity,
  Size_or_range,
  Urgency,
  Reason_of_Request,
  Additional_Note,
  Request_Status,
  Request_Post_Date,
  matchID
) VALUES
  (
    'REQ202603300001',
    'user04',
    '0-6 months',
    'Boy',
    'Diapers',
    2,
    1,
    'M',
    'High',
    'Weekly diaper use is higher than expected and we need emergency support.',
    'Preferred meetup in Sha Tin after 6pm.',
    'Open',
    '2026-03-20 19:00:00',
    'RD202603300001'
  ),
  (
    'REQ202603300002',
    'user03',
    '6-12 months',
    'Girl',
    'Baby bottle',
    3,
    0,
    '240ml+',
    'Medium',
    'Collecting a few bottles for a neighbour family with twins.',
    'Any district is fine if mailing is possible.',
    'Open',
    '2026-03-22 11:30:00',
    NULL
  );

INSERT INTO user_request_progress (
  Request_Donated_ID,
  Request_ID,
  Item_type,
  Request_User_ID,
  Donator_ID,
  Expect_quantity,
  Donated_quantity,
  Request_Post_Date,
  Donated_Date,
  Donated_Status
) VALUES
  (
    'RD202603300001',
    'REQ202603300001',
    'Diapers',
    'user04',
    'user02',
    2,
    1,
    '2026-03-20 19:00:00',
    '2026-03-23 15:45:00',
    'Pending'
  );

INSERT INTO `comment` (
  Comment_ID,
  DonateID,
  Type,
  SenderID,
  ReceiverID,
  CommentText,
  Rating,
  CommentDate
) VALUES
  (1, '1', 'donation', 'user02', 'user01', 'Bottle set was clean and exactly as described.', 5.0, '2026-03-14 09:15:00'),
  (2, 'RD202603300001', 'request', 'user04', 'user02', 'Thank you for arranging the diaper handoff quickly.', 4.5, '2026-03-24 20:10:00'),
  (3, '7', 'donation', 'user01', 'user03', 'Carrier condition was great and meetup was smooth.', 5.0, '2026-03-18 18:25:00');

INSERT INTO human_report (
  Report_ID,
  Report_User_ID,
  Report_Admin_ID,
  Report_Type,
  Report_Content,
  Report_Reporter_ID,
  Report_Donation_Item_ID,
  Report_Handle,
  Report_Processing_DateTime,
  Report_Processed_DateTime,
  Report_Case_Outcome
) VALUES
  (
    1,
    'user02',
    'admin01',
    'Text',
    'Suspicious resale wording in the description.',
    'user03',
    8,
    2,
    '2026-03-15 10:00:00',
    '2026-03-15 10:30:00',
    'Reviewed and allowed after manual verification.'
  ),
  (
    2,
    'user01',
    NULL,
    'Image',
    'Photo looked unrelated to the item title.',
    'user04',
    3,
    0,
    NULL,
    NULL,
    NULL
  );

INSERT INTO ai (ID, User_Message, AI_Message) VALUES
  (1, 'Can I donate opened formula?', 'Opened formula should not be donated. Please donate sealed products only.'),
  (2, 'How do I edit my item?', 'Open the item detail page and choose the edit action from your dashboard.');

INSERT INTO ai_text_setting (ID, open, judgement) VALUES
  ('Hate', '1', 2),
  ('Violence', '1', 2),
  ('SelfHarm', '1', 2),
  ('Sexual', '1', 2);

INSERT INTO ai_image_setting (ID, open, judgement) VALUES
  ('Hate', '1', 2),
  ('Violence', '1', 2),
  ('SelfHarm', '1', 2),
  ('Sexual', '1', 2);

INSERT INTO ai_text_result (
  ID,
  User_ID,
  Text_Content,
  Text_Hate,
  Text_SelfHarm,
  Text_Sexual,
  Text_Violence,
  Block,
  Checktime
) VALUES
  (1, 'user02', 'Please contact me privately for a cash exchange.', 0, 0, 0, 0, 0, '2026-03-19 09:40:00'),
  (2, 'user03', 'This post contains aggressive language and should be checked.', 1, 0, 0, 2, 1, '2026-03-21 16:20:00');

INSERT INTO ai_image_result (ID, User_ID, Checktime) VALUES
  (1, 'user01', '2026-03-19 09:45:00'),
  (2, 'user02', '2026-03-21 16:25:00');

INSERT INTO ai_image_result_photo (
  Photo_ID,
  ID,
  Photo_Path,
  Image_Hate,
  Image_SelfHarm,
  Image_Sexual,
  Image_Violence,
  Block
) VALUES
  (1, 1, 'violationIMG/065e1b0f76f36f70f17bbd2250b7f3c5', 0, 0, 0, 0, 0),
  (2, 2, 'violationIMG/7488a7e861c455568d0d5de105d7a97d', 0, 0, 1, 2, 1);

SET FOREIGN_KEY_CHECKS = 1;
