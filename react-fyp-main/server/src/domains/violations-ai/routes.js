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

//set the AI chat
router.post('/AIChat', authenticateJWT, (req, res) => {
    console.log(req.body); // 顯示整個請求體

    let sql = "INSERT INTO ai(ID,User_Message, AI_Message) VALUES (?, ?, ?)";
    // 遍歷req.body中的所有鍵值對
    let user_message = [];
    let ai_message = [];
    var num = 0;

    for (const [key, value] of Object.entries(req.body)) {
        console.log(`Key: ${key}, Value: ${value} `);
        if (num % 2 == 0) {
            user_message.push(value);
        } else {
            ai_message.push(value);
        }
        num++;
    }

    console.log(user_message.length);
    console.log(ai_message.length);

    if (user_message.length !== ai_message.length) {
        console.log("user_message.length != ai_message.length");
        return res.json({ message: "user_message.length != ai_message.length" });
    }


    //delete all data
    const sqlDelete = "TRUNCATE TABLE ai;";
    db.query(sqlDelete, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    });


    for (var i = 0; i < user_message.length; i++) {
        const values = [
            null,
            user_message[i],
            ai_message[i]
        ];
        let sql = "INSERT INTO ai(ID,User_Message, AI_Message) VALUES (?, ?, ?)";

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);  // Log the error to the server console
                return res.status(500).json({ message: 'Error inside server', error: err });
            }
        })
    }

    return res.json({ message: "AI Chat" });
});


//get the AI chat data
router.get('/getAIChat', (req, res) => {
    const sql = "SELECT * FROM ai ";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    })
});

//android user report the issue
router.post('/androiduserreporttheissue', authenticateJWT, (req, res) => {

    console.log(req.body);
    const sql = "INSERT INTO human_report (Report_ID ,Report_User_ID, Report_Admin_ID , Report_Type , Report_Content , Report_Reporter_ID ,Report_Donation_Item_ID ) VALUES (?, ?, ?, ?, ? ,? ,?)";
    const values = [
        null,
        req.body.User_ID,
        null,
        req.body.Report_Type,
        req.body.Report_Content,
        req.body.Reporter_ID,
        req.body.Donation_ID
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });
});

router.get('/listHumanReport', (req, res) => {
    const sql = "SELECT * FROM human_report";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });
});

router.get('/HumanReport/:humanReportID', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM human_report WHERE Report_ID = ?";
    const values = [req.params.humanReportID];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result[0]);
    });
});

router.post('/HumanReport/:humanReportID/updateStatus', authenticateJWT, (req, res) => {
    let sql;
    console.log(req.body);

    //Now date and time
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const todayDateAndTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    let values = [];
    if (req.body.newStatus == 1) {
        sql = "UPDATE human_report SET Report_Admin_ID = ? , Report_Handle = ? ,Report_Processing_DateTime = ?  WHERE Report_ID = ? ";
        values = [req.body.Login_id, req.body.newStatus, todayDateAndTime, req.params.humanReportID];
    } else {
        sql = "UPDATE human_report SET Report_Admin_ID = ? , Report_Handle = ? ,Report_Processed_DateTime = ?  , Report_Case_Outcome = ?  WHERE Report_ID = ? ";
        values = [req.body.Login_id, req.body.newStatus, todayDateAndTime, req.body.caseOutcome, req.params.humanReportID];
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });
});

//get the AI image detection violation setting
router.get('/get_ai_image_settings', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM ai_image_setting";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
});


//update AI image detection violation setting 
router.post('/ai_image_settings', authenticateJWT, async (req, res) => {
    console.log(req.body);

    const sql = "UPDATE ai_image_setting SET open = ?, judgement = ? WHERE ID = ?";

    // Wrap the db.query in a promise to use with async/await
    function updateSettings(values) {
        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    try {
        // Create an array of promises for the db queries
        await Promise.all([
            updateSettings([req.body.hate, req.body.hateValue, 'Hate']),
            updateSettings([req.body.violence, req.body.violenceValue, 'Violence']),
            updateSettings([req.body.selfharm, req.body.selfharmValue, 'SelfHarm']),
            updateSettings([req.body.sexual, req.body.sexualValue, 'Sexual'])
        ]);

        // If all queries succeed, send a success response
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        // If any query fails, catch the error and send an error response
        console.error(err);
        res.status(500).json(err);
    }
});


//get the AI text detection violation setting
router.get('/get_ai_text_settings', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM ai_text_setting";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
});


//update AI text detection violation setting 
router.post('/ai_text_settings', authenticateJWT, async (req, res) => {
    console.log(req.body);

    const sql = "UPDATE ai_text_setting SET open = ?, judgement = ? WHERE ID = ?";

    // Function to promisify the db.query for use with async/await
    function updateSettings(values) {
        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    try {
        // Execute all update operations concurrently and wait for them to complete
        await Promise.all([
            updateSettings([req.body.hate, req.body.hateValue, 'Hate']),
            updateSettings([req.body.violence, req.body.violenceValue, 'Violence']),
            updateSettings([req.body.selfharm, req.body.selfharmValue, 'SelfHarm']),
            updateSettings([req.body.sexual, req.body.sexualValue, 'Sexual'])
        ]);

        // Respond with success after all operations complete
        res.json({ message: 'Text settings updated successfully' });
    } catch (err) {
        // Handle any errors that occurred during the database operations
        console.error(err);
        res.status(500).json(err);
    }
});



//get the ai text result data
router.get('/getTextResultData', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM ai_text_result";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        }
        console.log(result);
        return res.json(result);

    });
});

//get the ai image result data
router.get('/getImageResultData', authenticateJWT, (req, res) => {
    const sql = `
    SELECT
    air.ID,
    air.User_ID,
    air.Checktime,
    MAX(airp.Image_Hate) AS MaxImage_Hate,
    MAX(airp.Image_SelfHarm) AS MaxImage_SelfHarm,
    MAX(airp.Image_Sexual) AS MaxImage_Sexual,
    MAX(airp.Image_Violence) AS MaxImage_Violence,
    MAX(airp.Block) AS Block
FROM
    ai_image_result air
JOIN
    ai_image_result_photo airp ON air.ID = airp.ID
GROUP BY
    air.ID, air.User_ID, air.Checktime;
    `
        ;
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        }

        return res.json(result);
    });
});

//get the Specific ai image result data
router.get('/getImageResulSpecifictData/:ID', authenticateJWT, (req, res) => {
    const sql = `
    SELECT * FROM ai_image_result_photo WHERE ID = ?;`
        ;
    const values = [req.params.ID];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        }

        return res.json(result);
    });
});


//add the user brower donation item record

router.post('/AzureSpeechToText', (req, res) => {
    const audioBase64 = req.body.audioBase64;
    console.log("azure speech to text")
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Generate a unique temporary file name
    const tempFileName = `temp_${Date.now()}.wav`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    // Save buffer to a temporary WAV file
    fs.writeFileSync(tempFilePath, audioBuffer);

    const speechConfig = sdk.SpeechConfig.fromSubscription(env.azureSpeech.key, env.azureSpeech.region);
    speechConfig.speechRecognitionLanguage = "zh-HK";

    function fromFile() {
        // Convert the audio file to the required format using ffmpeg
        ffmpeg(tempFilePath)
            .outputOptions([
                '-acodec pcm_s16le',
                '-ar 16000',
                '-ac 1'
            ])
            .output('converted_audio.wav')
            .on('end', () => {
                let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("converted_audio.wav"));
                let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

                speechRecognizer.recognizeOnceAsync(result => {
                    switch (result.reason) {
                        case sdk.ResultReason.RecognizedSpeech:
                            console.log(`RECOGNIZED: Text=${result.text}`);
                            break;
                        case sdk.ResultReason.NoMatch:
                            console.log("NOMATCH: Speech could not be recognized.");
                            break;
                        case sdk.ResultReason.Canceled:
                            const cancellation = sdk.CancellationDetails.fromResult(result);
                            console.log(`CANCELED: Reason=${cancellation.reason}`);

                            if (cancellation.reason == sdk.CancellationReason.Error) {
                                console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                                console.log("CANCELED: Did you set the speech resource key and region values?");
                            }
                            break;
                    }
                    speechRecognizer.close();
                    res.json(result.text);

                    // Delete the temporary files
                    fs.unlinkSync(tempFilePath);
                    fs.unlinkSync('converted_audio.wav');
                });
            })
            .on('error', (err) => {
                console.error('Error converting audio:', err);
                res.status(500).json({ error: 'Error converting audio' });

                // Delete the temporary file
                fs.unlinkSync(tempFilePath);
            })
            .run();
    }

    fromFile();
});


  return router;
}
