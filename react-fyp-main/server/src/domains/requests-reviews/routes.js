import express from 'express';

export default function createRouter(context) {
  const router = express.Router();
  const {
    axios,
    bcrypt,
    db,
    env,
    ffmpeg,
    fs,
    hashPassword,
    isBcryptHash,
    jwt,
    os,
    path,
    queryAsync,
    sdk,
    sharp,
    uploads,
    util,
    uuidv4,
    withTransaction,
    authenticateJWT,
  } = context;
  const { upload, uploadDonateIMG, uploadAnnouncement, uploadAdminIMG, violationIMG } = uploads;

//user add the free time 
router.post('/useraddfreetime', authenticateJWT, (req, res) => {

    console.log(req.body);

    const { startDate, endDate, repeat, userID, remark } = req.body;
    let repeatDays;
    if (repeat != null && repeat != '') {
        repeatDays = repeat.split(' ').map(day => {
            switch (day) {
                case 'Mon': return 1;
                case 'Tue': return 2;
                case 'Wed': return 3;
                case 'Thu': return 4;
                case 'Fri': return 5;
                case 'Sat': return 6;
                case 'Sun': return 0;
                default: return null;
            }
        }).filter(day => day !== null);
    }

    // 如果没有指定 repeat，直接插入单次时间
    if (!repeatDays || repeatDays.length === 0) {
        const sql = "INSERT INTO user_free_time (ID, User_ID, Free_Time_Start, Free_Time_End, Remark) VALUES (?, ?, ?, ?, ?)";
        const values = [null, userID, startDate, endDate, remark];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json(err);
                return;
            }
            console.log('Inserted one-time free time from', startDate, 'to', endDate);
            res.json({ message: "One-time free time inserted successfully" });
            return;
        });
    } else {
        // 处理重复的时间
        const start = new Date(startDate);
        const end = new Date(endDate);
        let date = new Date(start);

        const startTime = startDate.split(' ')[1];
        const endTime = endDate.split(' ')[1];

        while (date <= end) {
            if (repeatDays.includes(date.getDay())) {

                const datePart = date.toISOString().split('T')[0];
                const startDateTime = new Date(datePart + 'T' + startTime + 'Z').toISOString();
                const endDateTime = new Date(datePart + 'T' + endTime + 'Z').toISOString();

                const sql = "INSERT INTO user_free_time (ID, User_ID, Free_Time_Start, Free_Time_End, Remark) VALUES (?, ?, ?, ?, ?)";
                const values = [null, userID, startDateTime, endDateTime, remark];

                db.query(sql, values, (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Inserted repeated free time for', startDateTime, 'to', endDateTime);
                });
            }
            // 移至下一天
            date.setDate(date.getDate() + 1);
        }

        res.json({ message: "Repeat free time insertion process started" });
        return;
    }
});

//get the user free time
router.get('/userfreetime/:userID', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM user_free_time WHERE User_ID = ?";
    const values = [req.params.userID];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        }
        console.log(result);
        res.json(result);
        return;
    });
});



//get the user rating avg mark
router.get('/getUserRatingAvgMark/:userID', (req, res) => {
    console.log(req.params.userID);
    const sql = "SELECT ROUND(AVG(Rating), 1) AS avgMark ,COUNT(*) AS totalRatings FROM comment WHERE ReceiverID = ?";
    const values = [req.params.userID];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        console.log(result);
        return res.json(result[0]);
    });
});



//auto insert the data 
/*
router.get('/autoInsertData', (req, res) => {
 
    let data = [
        {
            "Item_Name": "Baby Bottle Set",
            "Category": "Baby bottle",
            "Description": "A set of 5 baby bottles with various sizes and nipple flows.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Sippy Cups",
            "Category": "Baby bottle",
            "Description": "A set of 3 spill-proof baby sippy cups with easy-grip handles and soft spouts.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Lightweight Baby Stroller",
            "Category": "Baby stroller",
            "Description": "A compact and easy-to-fold baby stroller, perfect for travel.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Jogging Baby Stroller",
            "Category": "Baby stroller",
            "Description": "A sturdy and smooth-riding baby stroller for active parents.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Convertible Crib",
            "Category": "Crib",
            "Description": "A convertible crib that can be transformed into a toddler bed.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Portable Crib",
            "Category": "Crib",
            "Description": "A lightweight and portable crib for easy travel and storage.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Baby Onesies Set",
            "Category": "Clothes",
            "Description": "A set of 5 cute and comfortable baby onesies in various colors.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Mittens",
            "Category": "Clothes",
            "Description": "A pair of soft and warm baby mittens to prevent scratching.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Socks Set",
            "Category": "Clothes",
            "Description": "A set of 6 pairs of cute and comfortable baby socks in various colors.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Sun Hat",
            "Category": "Clothes",
            "Description": "A soft and protective baby sun hat with a wide brim and chin strap.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Baby Snowsuit",
            "Category": "Clothes",
            "Description": "A warm and waterproof baby snowsuit for cold weather adventures.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Cloth Diapers",
            "Category": "Diapers",
            "Description": "A set of 10 reusable cloth diapers with adjustable snaps.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Disposable Diapers",
            "Category": "Diapers",
            "Description": "A pack of 50 disposable diapers in size 3 for babies 16-28 lbs.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Organic Milk Powder",
            "Category": "Milk powder",
            "Description": "A can of organic milk powder suitable for infants aged 6-12 months.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Hypoallergenic Milk Powder",
            "Category": "Milk powder",
            "Description": "A can of hypoallergenic milk powder for babies with sensitive tummies.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Carrier",
            "Category": "Others",
            "Description": "A comfortable and ergonomic baby carrier for infants up to 20 lbs.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Bath Tub",
            "Category": "Others",
            "Description": "A sturdy and easy-to-clean baby bath tub with a non-slip base.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Baby Bouncer",
            "Category": "Others",
            "Description": "A soft and entertaining baby bouncer with various toy attachments.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Electric Breast Pump",
            "Category": "Others",
            "Description": "A portable and efficient electric breast pump with multiple suction levels.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Baby Swaddle Blankets",
            "Category": "Others",
            "Description": "A set of 3 soft and breathable baby swaddle blankets for better sleep.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Food Processor",
            "Category": "Others",
            "Description": "A compact and versatile baby food processor for making homemade purees.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Playpen",
            "Category": "Others",
            "Description": "A spacious and safe baby playpen with a soft mat and colorful toys.",
            "Donate_Item_Status": "Well used"
        },
        {
            "Item_Name": "Baby Thermometer",
            "Category": "Others",
            "Description": "A reliable and accurate digital baby thermometer for easy temperature monitoring.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Jumper",
            "Category": "Others",
            "Description": "A fun and interactive baby jumper with a rotating seat and toy tray.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Baby Nail Clipper Set",
            "Category": "Others",
            "Description": "A set of baby nail clippers with a magnifying glass and soft grip handles.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Teething Toys",
            "Category": "Others",
            "Description": "A set of 5 baby teething toys in various shapes and textures for soothing sore gums.",
            "Donate_Item_Status": "Like new"
        },
        {
            "Item_Name": "Baby Night Light",
            "Category": "Others",
            "Description": "A soft and soothing baby night light with adjustable brightness and timer settings.",
            "Donate_Item_Status": "Lightly used"
        },
        {
            "Item_Name": "Baby Bib Set",
            "Category": "Others",
            "Description": "A set of 5 waterproof and easy-to-clean baby bibs with cute designs.",
            "Donate_Item_Status": "Brand new"
        },
        {
            "Item_Name": "Baby Pacifiers",
            "Category": "Others",
            "Description": "A set of 3 orthodontic baby pacifiers with a sterilizing case.",
            "Donate_Item_Status": "Like new"
        }
    ]
   
    const username = [
        'alex',
        'tom',
        'jerry',
        'jack',
        'peter',
    ]

    const location = [
        'ST IVE',
        'LWL IVE',
        'TM IVE',
        'HKDI',
    ]

    const mailingMethod = [
        'SF express',
        'HK post office',
        'Local delivery',
    ]

    const sql = "INSERT INTO user_donate_item  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    for (let i = 0; i < data.length; i++) {
        const values = [
            null,
            data[i].Item_Name,
            data[i].Category,
            username[i % username.length],
            null,
            data[i].Donate_Item_Status,
            'Available',
            0,
            data[i].Description,
            'HK',
            i % 2 == 0 ? 'T' : 'F', //if even number == T, if odd number == F
            i % 2 == 0 ? location[i % location.length] : null,   //if even number == location[i % location.length] , if odd number == null
            i % 2 == 0 ? 'F' : 'T', //if even number == F, if odd number == T
            i % 2 == 0 ? null : mailingMethod[i % mailingMethod.length],
        ];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json(err);
                return;
            }
        });
    }
})
*/

/*
router.get('/autoInsertData', (req, res) => {

    const sql = "INSERT INTO user_donate_item_details  VALUES (?,?,?,?,?,?,?)";

    //41-62
    for (let i = 41; i < 63; i++) {
        const values = [
            i,
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json(err);
                return;
            }
        });
    }

})
*/
/*
router.get('/autoInsertData', (req, res) => {

    const sql = "INSERT INTO user  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
    const username = [
        'alex',
        'tom',
        'jerry',
        'jack',
        'peter',
    ]
    const username2 = [
        'Alex',
        'Tom',
        'Jerry',
        'Jack',
        'Peter',
    ]
    const email = [
        'alex@gmail.com',
        'tom@gmail.com',
        'jerry@gmail.com',
        'jack@gmail.com',
        'peter@gmail.com'
    ]

    for (let i = 0; i < 5; i++) {
        const values = [
            username[i],
            username2[i],
            0,
            '123',
            '2024-3-19',
            'China(Hong Kong)',
            email[i],
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json(err);
                return;
            }
        });
    }


})
*/


// tat code from here
router.post('/createRequest', (req, res) => {
    let { Request_ID, Request_User_ID, Baby_age, Gender, Item_type, Expect_quantity, Size_or_range, Urgency, Reason_of_Request, Additional_Note, Request_Status } = req.body;

    // Remove the manual handling of Request_Post_Date and let MySQL set the timestamp

    // Generate a shorter ID: current timestamp + random 4 digits
    if (!Request_ID) {
        const timestamp = Date.now(); // Current time in milliseconds
        const randomComponent = Math.floor(1000 + Math.random() * 9000); // Generates a random number between 1000 and 9999
        Request_ID = `${timestamp}${randomComponent}`;
    }

    // Validation for required fields
    if (!Request_User_ID || !Baby_age || !Gender || !Item_type || !Expect_quantity || !Size_or_range || !Urgency || !Reason_of_Request || !Additional_Note) {
        return res.status(400).send('Missing required fields');
    }

    // Use NOW() to get the current timestamp for Request_Post_Date
    const query = "INSERT INTO user_request (Request_ID, Request_User_ID, Baby_age, Gender, Item_type, Expect_quantity, Donated_quantity, Size_or_range, Urgency, Reason_of_Request, Additional_Note, Request_Status, Request_Post_Date) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, NOW())";

    db.query(query, [Request_ID, Request_User_ID, Baby_age, Gender, Item_type, Expect_quantity, Size_or_range, Urgency, Reason_of_Request, Additional_Note, Request_Status], (error, results) => {
        if (error) {
            console.error("Database Error:", error);
            res.status(500).send('Server error');
        } else {
            res.status(200).send({ message: 'Data inserted successfully', id: Request_ID });
        }
    });
});






//get data for the RequestFragment
router.get('/api/user-requests', (req, res) => {
    const updateStatusQuery = `
        UPDATE user_request
        SET Request_Status = 'Close'
        WHERE Donated_quantity >= Expect_quantity AND Request_Status = 'Open'`;

    const fetchQuery = `
        SELECT 
            ur.Request_ID, 
            ur.Request_User_ID, 
            ur.Item_type, 
            ur.Expect_quantity, 
            ur.Donated_quantity,
            u.User_image 
        FROM 
            user_request ur 
            JOIN user u ON ur.Request_User_ID = u.ID
        WHERE 
            ur.Request_Status = 'Open'`;

    // First update the status of the requests
    db.query(updateStatusQuery, (updateError) => {
        if (updateError) {
            console.error('Database Error in Update:', updateError);
            res.status(500).send('Server error during update');
            return;
        }

        // Then fetch the requests with the updated status
        db.query(fetchQuery, (fetchError, results) => {
            if (fetchError) {
                console.error('Database Error in Fetch:', fetchError);
                res.status(500).send('Server error during fetch');
            } else {
                res.json(results);
            }
        });
    });
});

//get data to the RequestItemDataActivity.java
router.get('/api/user-request-details/:requestId', (req, res) => {
    const requestId = req.params.requestId;
    const query = `
        SELECT 
            ur.*, 
            u.User_image 
        FROM 
            user_request ur 
            JOIN user u ON ur.Request_User_ID = u.ID 
        WHERE 
            ur.Request_ID = ?`;

    db.query(query, [requestId], (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            res.status(500).send('Server error');
        } else {
            res.json(results[0]);
        }
    });
});

//add the data of donate the request

// Example endpoint adjustment to accept RequestDonatedId from the request body
router.post('/api/addDonationRecord', (req, res) => {
    const { requestId, itemType, requestUserId, donatorId, expectQuantity, donatedQuantity, requestPostDate, requestDonatedId } = req.body;

    const query = `
        INSERT INTO user_request_progress 
        (Request_Donated_ID, Request_ID, Item_type, Request_User_ID, Donator_ID, Expect_quantity, Donated_quantity, Request_Post_Date, Donated_Date, Donated_Status) 
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Pending')`;

    // Ensure the requestDonatedId is used here instead of generating a new one
    db.query(query, [requestDonatedId, requestId, itemType, requestUserId, donatorId, expectQuantity, donatedQuantity, requestPostDate], (error, results) => {
        if (error) {
            console.error('Error inserting donation record:', error);
            return res.status(500).send('Server error occurred');
        }
        res.status(200).send('Donation record added successfully');
    });
});









// get the request data to the chat
router.get('/api/user-request-progress/:requestDonatedId', (req, res) => {
    // Capture the requestDonatedId from the route parameter
    const requestDonatedId = req.params.requestDonatedId;

    const query = `
        SELECT 
            urp.Request_Donated_ID, 
            urp.Request_ID, 
            urp.Item_type, 
            urp.Request_User_ID, 
            urp.Donator_ID,
            urp.Expect_quantity, 
            urp.Donated_quantity,
            urp.Request_Post_Date,
            urp.Donated_Date,
            urp.Donated_Status
        FROM 
            user_request_progress urp
        WHERE 
            urp.Request_Donated_ID = ?
    `; // Use a placeholder for parameterized query to prevent SQL injection

    // Execute the query with the requestDonatedId as the parameter
    db.query(query, [requestDonatedId], (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            res.status(500).send('Server error');
        } else {
            if (results.length > 0) {
                res.json(results[0]); // Assuming Request_Donated_ID is unique, return the first (and only) result
            } else {
                res.status(404).send('Request progress data not found');
            }
        }
    });
});

router.post('/api/submitComment', (req, res) => {
    console.log("Received comment submission: ", req.body);
    const { donateID, type, senderID, receiverID, commentText, rating } = req.body;

    // Check for missing fields
    if (!donateID || !type || !senderID || !receiverID || !commentText || rating == null) {
        return res.status(400).send('Missing required fields');
    }

    // SQL query to insert the new comment
    const query = `
        INSERT INTO comment (DonateID, Type, SenderID, ReceiverID, CommentText, Rating) 
        VALUES (?, ?, ?, ?, ?, ?)`;

    // Executing the query
    db.query(query, [donateID, type, senderID, receiverID, commentText, rating], (error, results) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).send('Server error');
        }
        res.status(200).send({ message: 'comment submitted successfully' });
    });
});

// show the Me_requests list:

router.get('/api/me-user-requests', (req, res) => {
    // Retrieve userID from query parameter
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).send('User ID is required');
    }

    const query = `
        SELECT 
            ur.Request_ID, 
            ur.Request_User_ID, 
            ur.Item_type, 
            ur.Expect_quantity, 
            ur.Donated_quantity,
            u.User_image 
        FROM 
            user_request ur 
            JOIN user u ON ur.Request_User_ID = u.ID
        WHERE 
            ur.Request_User_ID = ?`;

    // Execute the query with the userID parameter
    db.query(query, [userID], (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});



// API to for the user reviews
router.get('/api/user-reviews', (req, res) => {
    const userID = req.query.userID; // Retrieve userID from query parameter
    if (!userID) {
        return res.status(400).send('User ID is required');
    }

    // Adjusted query to correctly fetch user comments based on SenderID and include User_image from the user table
    const query = `
        SELECT 
            comment.SenderID, 
            comment.CommentText, 
            comment.CommentDate, 
            comment.Rating, 
            user.User_image
        FROM 
            comment
        JOIN 
            user ON comment.SenderID = user.ID
        WHERE 
            comment.SenderID = ?`;

    db.query(query, [userID], (error, results, fields) => {
        if (error) {
            console.error('Database Query Error:', error);
            return res.status(500).send('Failed to retrieve data due to server error');
        }
        if (results.length === 0) {
            return res.status(404).send('No comments found for this user');
        }
        res.json(results);
    });
});

// API to for the user about
router.get('/api/user-about', (req, res) => {
    const userID = req.query.userID;
    console.log("Fetching comments for ReceiverID:", userID);  // Debug log

    if (!userID) {
        console.log("User ID is required but not provided");
        return res.status(400).send('User ID is required');
    }

    const query = `
        SELECT 
            comment.SenderID, 
            comment.CommentText, 
            comment.CommentDate, 
            comment.Rating, 
            user.User_image
        FROM 
            comment
        JOIN 
            user ON comment.SenderID = user.ID
        WHERE 
            comment.ReceiverID = ?`;

    db.query(query, [userID], (error, results, fields) => {
        if (error) {
            console.error('Database Query Error:', error);
            return res.status(500).send('Failed to retrieve data due to server error');
        }
        if (results.length === 0) {
            console.log("No comments found for User ID:", userID);
            return res.status(404).send('No comments found for this user');
        }
        res.json(results);
    });
});

// chat list show item type
router.get('/item_type/:donateId', authenticateJWT, (req, res) => {
    const donateId = req.params.donateId;
    if (donateId.startsWith("RD")) {
        const query = 'SELECT Item_type FROM user_request_progress WHERE Request_Donated_ID = ?';
        db.query(query, [donateId], (err, results) => {
            if (err) {
                res.status(500).json({ message: 'Internal server error', error: err });
            } else if (results.length > 0) {
                res.json({ item_type: results[0].Item_type });
            } else {
                res.status(404).json({ message: 'Item type not found' });
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid donateId' });
    }
});

// update the data of the request after both is finish
router.post('/api/mark-as-donated', (req, res) => {
    const donateId = req.query.donateId;
    if (!donateId) {
        return res.status(400).send('Donate ID is required');
    }

    const updateQuery = `
        UPDATE user_request_progress
        SET Donated_Status = 'Donated'
        WHERE Request_Donated_ID = ?`;

    db.query(updateQuery, [donateId], (error, results) => {
        if (error) {
            console.error('Database Update Error:', error);
            return res.status(500).send('Failed to update donation status');
        }
        if (results.changedRows === 0) {
            return res.status(404).send('No donation found with the given ID');
        }
        res.send('Donation status updated successfully');
    });
});


router.post('/api/update-donation-quantities', (req, res) => {
    const donateId = req.query.donateId;  // Receiving the donateId directly from the query string
    console.log("Received donateId for update: ", donateId);

    if (!donateId) {
        return res.status(400).send('Missing donateId');
    }

    // First, find the total Donated_quantity associated with this Request_Donated_ID in user_request_progress
    const sumQuery = `
        SELECT Request_ID, SUM(Donated_quantity) AS TotalDonated
        FROM user_request_progress
        WHERE Request_Donated_ID = ?
        GROUP BY Request_ID`;

    db.query(sumQuery, [donateId], (error, sumResults) => {
        if (error) {
            console.error("Database Error during SUM calculation:", error);
            return res.status(500).send('Database error during calculation');
        }

        if (sumResults.length === 0) {
            return res.status(404).send({ message: 'No corresponding records found for the given donateId' });
        }

        const { Request_ID, TotalDonated } = sumResults[0];
        console.log("Updating Request_ID: ", Request_ID, " with TotalDonated: ", TotalDonated);

        // Now update the Donated_quantity in the user_request table using the fetched total
        const updateQuery = `
            UPDATE user_request
            SET Donated_quantity = Donated_quantity + ?
            WHERE Request_ID = ?`;

        db.query(updateQuery, [TotalDonated, Request_ID], (updateError, updateResults) => {
            if (updateError) {
                console.error("Database Error during update:", updateError);
                return res.status(500).send('Database error during update');
            }
            console.log("Update successful for Request_ID: ", Request_ID);
            res.send({ message: 'Donated quantity updated successfully' });
        });
    });
});





//end of tat code?

  return router;
}
