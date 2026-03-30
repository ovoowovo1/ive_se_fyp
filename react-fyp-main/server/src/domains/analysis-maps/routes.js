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

//get the number of account create in the past 7day
router.get('/api/newaccounts', authenticateJWT, (req, res) => {
    const query = `
    SELECT DateTable.Date AS CreateDate, COUNT(user.ID) AS NewAccounts
    FROM (
       SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY as Date
       FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
       CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
       CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
    ) as DateTable
    LEFT JOIN user
    ON DATE(user.User_Create_Date) = DateTable.Date
    WHERE DateTable.Date >= CURDATE() - INTERVAL 7 DAY
    GROUP BY DateTable.Date;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while querying the database.' });
            return;
        }

        res.json(results);
    });
});

//get the number of account create (range)
router.get('/api/newaccounts2', authenticateJWT, (req, res) => {
    const { startDate, endDate } = req.query;

    // Sanitize and validate input dates
    // IMPORTANT: Always validate and sanitize inputs to avoid SQL injection and other security risks.
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please specify both startDate and endDate query parameters.' });
    }

    // Your query can be modified to accept the date range from the request parameters
    const query = `
    SELECT DateTable.Date AS CreateDate, COUNT(user.ID) AS NewAccounts
    FROM (
       SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY as Date
       FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
       CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
       CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
    ) as DateTable
    LEFT JOIN user
    ON DATE(user.User_Create_Date) = DateTable.Date
    WHERE DateTable.Date BETWEEN ? AND ?
    GROUP BY DateTable.Date
    ORDER BY DateTable.Date;
    `;

    // Use prepared statements to secure against SQL injection
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while querying the database.' });
            return;
        }

        res.json(results);
    });
});


//get the number of each donte item
router.get('/api/NumberOfDonateitem', authenticateJWT, (req, res) => {
    const query = `
    SELECT ic.classification_Name, COALESCE(COUNT(udi.Donate_Item_ID), 0) AS ItemCount
    FROM item_classification ic
    LEFT JOIN user_donate_item udi 
      ON ic.classification_Name = udi.Donate_Item_type
      AND udi.Donate_Item_Violation = 0 
      AND udi.Donate_Status = 'Available'
    GROUP BY ic.classification_Name;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while querying the database.' });
            return;
        }

        res.json(results);
    });
});

//get the number of each request item 
router.get('/api/NumberOfRequestitem', authenticateJWT, (req, res) => {
    const query = `
    SELECT ic.classification_Name, COALESCE(COUNT(udi.Request_ID ), 0) AS ItemCount
    FROM item_classification ic
    LEFT JOIN user_request udi 
      ON ic.classification_Name = udi.Item_type
      AND udi.matchID IS NOT NULL
    GROUP BY ic.classification_Name
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while querying the database.' });
            return;
        }

        res.json(results);
    });
});


//get the number of each text violation

router.post('/userbrowerdonationitemrecord', authenticateJWT, (req, res) => {
    console.log(req.body);
    //req.body.browseTime is millisecond need to convert to second (integer)
    const browseSecond = Math.floor(req.body.browseTime / 1000);
    const values = [
        null,
        req.body.userId,
        req.body.itemId,
        browseSecond,
        null
    ]
    const sql = "INSERT INTO user_browse (ID, User_ID, Donation_Item_ID, Browse_Time ,Browse_Date ) VALUES (?, ?, ?, ? ,?)";

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        }

        return res.json(result);
    });
});

//get the data for recommendation system
router.get('/getRecommendationData', async (req, res) => {
    try {
        // Query for donate data
        const donateData = await new Promise((resolve, reject) => {
            const sql = "SELECT Donate_Item_ID,Donate_Item_Name AS Item_Name , Donate_Item_type ,Donate_Item_Describe , Donate_Item_Post_Date AS Item_Post_Date , Donate_Item_Status  FROM user_donate_item";
            db.query(sql, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        // Query for collect data
        const collectData = await new Promise((resolve, reject) => {
            const sql2 = "SELECT * FROM user_collect";
            db.query(sql2, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });


        const browseDate = await new Promise((resolve, reject) => {
            const sql3 = "SELECT * FROM user_browse";
            db.query(sql3, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });


        // Return the combined data
        return res.json({ donate: donateData, collect: collectData, browse: browseDate });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});



// user get the recommendation result
router.get('/usergetrecommendationresult/:userID', async (req, res) => {
    console.log(req.params.userID);
    try {
        // Send GET request to the API
        const response = await axios.get(`${env.ai.serviceBaseUrl}/recommendation`, {
            params: {
                userID: req.params.userID
            }
        });

        // Parse the JSON data
        const jsonData = JSON.parse(response.data);
        console.log(jsonData);

        // Extract the Donate_Item_ID and score pairs from the JSON data
        const itemScores = Object.entries(jsonData);

        // Sort the item scores in descending order based on the score
        itemScores.sort((a, b) => b[1] - a[1]);

        // Extract the sorted Donate_Item_IDs
        const sortedItemIds = itemScores.map(item => item[0]);

        // Construct the SQL query
        const sql = `
            SELECT
                dp.Donate_Item_ID,
                MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
                MIN(dp.Donate_Photo) AS First_Photo,
                udi.Donate_User_ID,
                udi.Donate_Item_Name,
                u.User_image,
                MAX(CASE
                    WHEN uc.User_collectID IS NOT NULL AND uc.User_ID = ? THEN 'Collected'
                    ELSE 'Not Collected'
                END) AS Collection_Status
            FROM
                donate_photos dp
            JOIN
                user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
            JOIN
                user u ON udi.Donate_User_ID = u.ID
            LEFT JOIN
                user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID
            WHERE
                dp.Donate_Item_ID IN (${sortedItemIds.join(',')}) AND  udi.Donate_Item_Violation = 0 AND udi.Donate_Status != 'Deleted'
            GROUP BY
                dp.Donate_Item_ID
            ORDER BY
                FIELD(dp.Donate_Item_ID, ${sortedItemIds.join(',')});
        `;

        db.query(sql, [req.params.userID], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }
            return res.json(result);
        });

    } catch (error) {
        console.error('Error fetching recommendation data:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation data' });
    }
});

//amdin get the donation item data
router.get('/getMapDonationItemDataAndlatlon', authenticateJWT, (req, res) => {
    const sql = `
    SELECT
    ui.Donate_Item_ID as id,
        ui.Donate_Item_Name as name,
        dp.Donate_Photo as photo,
        ui.Donate_Item_MeetupLocation as location,
        ui.Donate_Item_Post_Date as date,
        ui.Donate_Item_type as type
FROM user_donate_item ui
INNER JOIN
        (SELECT Donate_Item_ID, MIN(Donate_Photo_ID) AS MinPhotoID
   FROM donate_photos
   GROUP BY Donate_Item_ID
        ) dpi ON ui.Donate_Item_ID = dpi.Donate_Item_ID
INNER JOIN donate_photos dp ON dpi.Donate_Item_ID = dp.Donate_Item_ID AND dpi.MinPhotoID = dp.Donate_Photo_ID
WHERE ui.Donate_Status != 'Deleted' AND ui.Donate_Item_Violation = 0 AND ui.Donate_Item_MeetupLocation IS NOT NULL AND ui.Donate_Item_MeetupLocation !="";
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        console.log(result);
        // Use Google Maps Geocoding API to get lat and lon for each location
        const promises = result.map(async (item) => {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(item.location + ', Hong Kong')}&key=${env.googleMaps.apiKey}`);
            const data = await response.json();
            if (data.results.length > 0) {
                let { lat, lng } = data.results[0].geometry.location;


                const offset = 0.0001; // Random offset to prevent markers from overlapping
                lat += Math.random() * offset * 2 - offset;
                lng += Math.random() * offset * 2 - offset;

                item.lat = lat;
                item.lon = lng;
            }
            return item;
        });
        Promise.all(promises)
            .then((updatedResult) => {
                return res.json(updatedResult);
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).json(error);
            });
    });
});


//get map donation item data
router.get('/getMapDonationItemData', authenticateJWT, (req, res) => {
    const sql = `
    SELECT
    ui.Donate_Item_ID as id,
        ui.Donate_Item_Name as name,
        dp.Donate_Photo as photo,
        ui.Donate_Item_MeetupLocation as location,
        ui.Donate_Item_Post_Date as date,
        ui.Donate_Item_type as type
FROM user_donate_item ui
INNER JOIN
        (SELECT Donate_Item_ID, MIN(Donate_Photo_ID) AS MinPhotoID
   FROM donate_photos
   GROUP BY Donate_Item_ID
        ) dpi ON ui.Donate_Item_ID = dpi.Donate_Item_ID
INNER JOIN donate_photos dp ON dpi.Donate_Item_ID = dp.Donate_Item_ID AND dpi.MinPhotoID = dp.Donate_Photo_ID
WHERE ui.Donate_Status != 'Deleted' AND ui.Donate_Item_Violation = 0;
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        console.log(result);
        return res.json(result);
    });
});


//get the user nearby donation item data
router.get('/getUserNearbyDonationItemData/:userID/:lat/:lon', (req, res) => {

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    const radius = 6371; // Radius of the Earth in kilometers

    const sql = `
    SELECT 
        dp.Donate_Item_ID, 
        udi.Donate_Item_MeetupLocation,
        MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
        MIN(dp.Donate_Photo) AS First_Photo,
        udi.Donate_User_ID,
        udi.Donate_Item_Name,
        u.User_image,
        MAX(CASE 
            WHEN uc.User_collectID IS NOT NULL AND uc.User_ID = ? THEN 'Collected'
            ELSE 'Not Collected'
        END) AS Collection_Status
    FROM 
        donate_photos dp
    JOIN 
        user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
    JOIN
        user u ON udi.Donate_User_ID = u.ID
    LEFT JOIN
        user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID
    WHERE 
        udi.Donate_Item_Violation = 0 AND udi.Donate_Status != 'Deleted' AND udi.Donate_Item_MeetupLocation IS NOT NULL AND udi.Donate_Item_MeetupLocation != ''
    GROUP BY 
        dp.Donate_Item_ID
    ORDER BY
        dp.Donate_Item_ID DESC
`;

    const values = [req.params.userID];

    db.query(sql, values, async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        const userLat = parseFloat(req.params.lat);
        const userLon = parseFloat(req.params.lon);

        const donationItemsWithDistance = await Promise.all(
            results.map(async (item) => {
                const locationName = `${item.Donate_Item_MeetupLocation} Hong Kong`;
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    locationName
                )}&key=${env.googleMaps.apiKey}`;

                try {
                    const response = await axios.get(geocodeUrl);
                    const location = response.data.results[0].geometry.location;
                    const itemLat = location.lat;
                    const itemLon = location.lng;

                    const dLat = toRadians(itemLat - userLat);
                    const dLon = toRadians(itemLon - userLon);

                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(toRadians(userLat)) * Math.cos(toRadians(itemLat)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = radius * c;

                    //order by distance ASC
                    return {
                        ...item,
                        distance: distance.toFixed(2) // Distance in kilometers rounded to 2 decimal places
                    };

                } catch (error) {
                    console.error(`Error geocoding location: ${locationName}`, error);
                    return item;
                }
            })
        );

        // Sort the donation items by distance in ascending order
        donationItemsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(donationItemsWithDistance);
    });

});




  return router;
}
