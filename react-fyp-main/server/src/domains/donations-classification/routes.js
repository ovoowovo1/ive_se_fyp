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

router.get('/listdonateditemdata', authenticateJWT, (req, res) => {
    /*  if (req.user.Admin_Permission_Admin !== 1) {
          return res.status(403).json({ message: 'Forbidden' });
      }*/
    const sql = "SELECT Donate_Item_ID  ,Donate_Item_Name,Donate_User_ID ,Donate_Item_Post_Date,Donate_Status,Donate_Item_Violation FROM user_donate_item";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
})


router.post('/updatedonatedviolation', authenticateJWT, (req, res) => {
    const sql = "UPDATE user_donate_item SET Donate_Item_Violation	=(?) WHERE Donate_Item_ID= (?)";
    if (req.body.donateViolation === 0) {
        req.body.donateViolation = 1;
    } else {
        req.body.donateViolation = 0;
    }

    const values = [
        req.body.donateViolation,
        req.body.donateItemID,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
})

//the donate item data
router.get('/donateitem/:donteitem_id', authenticateJWT, (req, res) => {

    const sql = "SELECT * FROM user_donate_item WHERE  Donate_Item_ID = ? ";
    const values = [req.params.donteitem_id];
    //const file = req.file;
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, msg: 'Internal Server Error', error: err });
            return;
        }

        if (result.length > 0) {
            //get the photo
            const sql2 = "SELECT Donate_Photo_ID ,Donate_Photo FROM donate_photos WHERE  Donate_Item_ID = ? ";
            const values2 = [req.params.donteitem_id];
            db.query(sql2, values2, (err, result2) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 500, msg: 'Internal Server Error', error: err });
                    return;
                }
                result[0]['photos'] = result2;
                res.status(200).json(result[0]); // Send the first (and presumably only) result
            });

        } else {
            res.status(404).json({ status: 404, msg: 'donate item not found' });
        }
    });
});


//the donate item detail data
router.get('/donateitemdetail/:donteitem_id', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM user_donate_item_details WHERE  Item_details_ID = ? ";
    const values = [req.params.donteitem_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, msg: 'Internal Server Error', error: err });
            return;
        }

        if (result.length > 0) {
            res.status(200).json(result[0]); // Send the first (and presumably only) result
        } else {
            res.status(404).json({ status: 404, msg: 'donate item not found' });
        }
    });
});


//edit the donate item
router.post('/editdonateitem/:donateitem_id', authenticateJWT, uploadDonateIMG.array('upload'), (req, res) => {
    console.log(req.body);
    console.log("--------------------");
    console.log(req.files);

    let filteredAndTransformedUploadData = null;
    const uploadDataOriginal = req.body.upload;
    console.log(uploadDataOriginal);
    if (uploadDataOriginal == 'undefined' || !uploadDataOriginal || uploadDataOriginal.length === 0) {
        console.log('uploadDataOriginal is undefined, not an array, or empty.');
    } else {
        filteredAndTransformedUploadData = uploadDataOriginal
            .filter(item => item !== 'undefined') // Remove 'undefined' values
            .map(url => {
                // Remove the unnecessary part of the URL and replace '/' with '\'
                // Note: In the actual output, there will be a single '\', not '\\'
                return url
                    .replace(`${env.app.baseUrl}/`, '')
                    .replace(/\//g, '\\'); // Here '\\' represents a single backslash in the string literal
            });

        console.log(filteredAndTransformedUploadData);
    }



    let meetup = 'F';
    let mailingDelivery = 'F';

    if (req.body.Donate_Item_MeetupMailingDelivery == 1) {
        meetup = 'T';
    } else if (req.body.Donate_Item_MeetupMailingDelivery == 2) {
        mailingDelivery = 'T';
    } else {
        meetup = 'T';
        mailingDelivery = 'T';
    }

    const values = [
        req.body.Donate_Item_Name,
        req.body.Donate_Item_type,
        req.body.Donate_Item_Describe,
        req.body.Donate_Item_Location,
        meetup,
        req.body.Meetup_Location,
        mailingDelivery,
        req.body.Delivery_Method,
        req.params.donateitem_id
    ];


    // 获取req.body的所有键
    const keys = Object.keys(req.body);

    // 过滤掉不想看到的键
    const filteredKeys = keys.filter(key =>
        key !== 'Donate_Item_Name' &&
        key !== 'Donate_Item_Type' &&
        key !== 'Donate_Item_Describe' &&
        key !== 'Donate_Item_Location' &&
        key !== 'Donate_Item_MeetupMailingDelivery' &&
        key !== 'Meetup_Location' &&
        key !== 'Delivery_Method' &&
        key !== 'Donate_Item_Status' &&
        key !== 'Donate_Item_type' &&
        key !== 'upload');


    // 创建一个新对象，仅包含过滤后的键和对应的值
    const filteredBody = {};
    filteredKeys.forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== 'undefined') {
            filteredBody[key] = req.body[key];
        }
    });

    // 输出过滤后的对象
    console.log(filteredBody);

    // 假设 filteredBody 已经存在并包含了我们想要更新的键值对

    // 创建一个数组来存储键（对应数据库中的列名）和更新的值
    let updateColumns = [];
    let updateValues = [];

    // 遍历filteredBody对象，构建更新语句的列部分
    Object.keys(filteredBody).forEach(key => {
        updateColumns.push(`${key} = ?`);
        updateValues.push(filteredBody[key]);
    });

    console.log(filteredBody);

    const sql = "UPDATE user_donate_item SET Donate_Item_Name = ?, Donate_Item_type = ?, Donate_Item_Describe = ?, Donate_Item_Location = ? ,Donate_Item_Meetup = ? , Donate_Item_MeetupLocation = ? , Donate_Item_MailingDelivery = ? ,Donate_Item_MailingDeliveryMethod = ?  WHERE Donate_Item_ID = ?";

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }

        //get the photo data
        const sqlGetPhoto = "SELECT Donate_Photo FROM donate_photos WHERE  Donate_Item_ID = ? ";
        const valuesGetPhoto = [req.params.donateitem_id];
        db.query(sqlGetPhoto, valuesGetPhoto, (err, resultGetPhoto) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error inside server', error: err });
            }



            // 将更新的列和更新的值添加到SQL语句中
            if (updateColumns.length > 0) {
                const sql2 = `UPDATE user_donate_item_details SET ${updateColumns.join(', ')} WHERE Item_details_ID = ?`;
                // 向values数组中添加donateitem_id作为更新的条件
                updateValues.push(req.params.donateitem_id);

                db.query(sql2, updateValues, (err, result) => {
                    if (err) {
                        console.error(err);  // Log the error to the server console
                        return res.status(500).json({ message: 'Error inside server', error: err });
                    }
                });
            }
            const getPhoto = resultGetPhoto;
            console.log(getPhoto);

            if (filteredAndTransformedUploadData != null) {
                const placeholders = filteredAndTransformedUploadData.map(() => '?').join(',');
                const sqlDeletePhotoNotInList = `DELETE FROM donate_photos WHERE Donate_Photo NOT IN (${placeholders}) AND Donate_Item_ID = ?`;

                const valuesDeletePhotoNotInList = [...filteredAndTransformedUploadData, req.params.donateitem_id];

                db.query(sqlDeletePhotoNotInList, valuesDeletePhotoNotInList, (err, result) => {
                    if (err) {
                        console.error(err); // Log the error to the server console
                        return res.status(500).json({ message: 'Error inside server', error: err });
                    }

                    // 成功删除不在列表中的照片后的处理...
                    const sqlGetPhotoMaxID = "SELECT MAX(Donate_Photo_ID) AS maxID FROM donate_photos WHERE  Donate_Item_ID = ? ";
                    const valuesGetPhotoMaxID = [req.params.donateitem_id];
                    db.query(sqlGetPhotoMaxID, valuesGetPhotoMaxID, (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Error inside server', error: err });
                        }
                        let maxID = result[0].maxID;

                        if (maxID == null) {
                            maxID = 0;
                        }

                        const sql3 = "INSERT INTO donate_photos (Donate_Item_ID , Donate_Photo_ID ,Donate_Photo) VALUES (?, ? , ?)";
                        if (req.files) {
                            for (let i = 0; i < req.files.length; i++) {
                                let values3 = [
                                    req.params.donateitem_id,
                                    maxID + i + 1,
                                    req.files[i].path
                                ];
                                db.query(sql3, values3, (err, result) => {
                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ message: 'Error inside server', error: err });
                                    }
                                });
                            }

                        }
                        return res.json(result);
                    });
                });
            } else {
                // Get the maximum Donate_Photo_ID for the given Donate_Item_ID
                const sqlGetMaxPhotoID = "SELECT MAX(Donate_Photo_ID) AS maxPhotoID FROM donate_photos WHERE Donate_Item_ID = ?";
                db.query(sqlGetMaxPhotoID, [req.params.donateitem_id], (err, resultMaxPhotoID) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Error inside server', error: err });
                    }

                    let maxPhotoID = resultMaxPhotoID[0].maxPhotoID || 0;

                    const sql3 = "INSERT INTO donate_photos (Donate_Item_ID, Donate_Photo_ID, Donate_Photo) VALUES (?, ?, ?)";

                    if (req.files) {
                        const insertPromises = req.files.map((file, index) => {
                            const values3 = [
                                req.params.donateitem_id,
                                maxPhotoID + index + 1,
                                file.path
                            ];
                            return new Promise((resolve, reject) => {
                                db.query(sql3, values3, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        });

                        Promise.all(insertPromises)
                            .then(() => {
                                return res.json(result);
                            })
                            .catch((err) => {
                                console.error(err);
                                return res.status(500).json({ message: 'Error inside server', error: err });
                            });
                    } else {
                        return res.json(result);
                    }
                });
            }
        });
    });
});

//donate classification data
router.post('/donateclassificationdata', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM item_classification";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});


//android donate classification data
router.post('/androiddonateclassificationdata', authenticateJWT, (req, res) => {
    const sql = "SELECT classification_Name FROM item_classification";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        //console.log(result);    
        return res.json(result);
    })
});

//donate classification attribute data
router.post('/donateclassificationattributedata', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM item_classification_attribute";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});

//add new classification attribute 
router.post('/addnewclassificationattribute', authenticateJWT, (req, res) => {
    console.log(req.body);
    let sql = "";
    let values = [];
    let needAddoptions = false;
    let sqlAddColumn = "";
    let max = 0;

    if (req.body.attributeEnterMethod === "checkbox" || req.body.attributeEnterMethod === "radiobutton" || req.body.attributeEnterMethod === "select") {
        //check req.body.additionalOptions's option the max length

        for (let i = 0; i < req.body.additionalOptions.length; i++) {
            if (req.body.additionalOptions[i].option.length > max) {
                max = req.body.additionalOptions[i].option.length;
            }
        }
        if (req.body.attributeDataType === "string") {
            sqlAddColumn = "ALTER TABLE user_donate_item_details ADD COLUMN " + req.body.attributeName + " VARCHAR(" + max + ") NULL";
        } else {
            sqlAddColumn = "ALTER TABLE user_donate_item_details ADD COLUMN " + req.body.attributeName + " int(" + max + ") NULL";
        }


    } else if (req.body.attributeDataType === "string") {
        sqlAddColumn = "ALTER TABLE user_donate_item_details ADD COLUMN " + req.body.attributeName + " VARCHAR(" + req.body.attributeMaxLength + ") NULL";

    } else {
        //date
        sqlAddColumn = "ALTER TABLE user_donate_item_details ADD COLUMN " + req.body.attributeName + " DATE NULL";
    }


    if (req.body.attributeDataType === "date") {
        sql = "INSERT INTO item_attribute (Attribute_ID  , Attribute_Name,Attribute_Type,Attribute_DataType,Attribute_Length) VALUES (?, ? , ? ,? ,?)";

        values = [
            null,
            req.body.attributeName,
            "datepicker",
            req.body.attributeDataType,
            null
        ];
    } else if (req.body.attributeEnterMethod === "checkbox" || req.body.attributeEnterMethod === "radiobutton" || req.body.attributeEnterMethod === "select") {
        sql = "INSERT INTO item_attribute (Attribute_ID  , Attribute_Name,Attribute_Type,Attribute_DataType,Attribute_Length) VALUES (?, ? , ? ,? ,?)";

        values = [
            null,
            req.body.attributeName,
            req.body.attributeEnterMethod,
            req.body.attributeDataType,
            max
        ];
        needAddoptions = true;

    } else {
        //TextBox
        sql = "INSERT INTO item_attribute (Attribute_ID  , Attribute_Name,Attribute_Type,Attribute_DataType,Attribute_Length) VALUES (?, ? , ? ,? ,?)";

        values = [
            null,
            req.body.attributeName,
            req.body.attributeEnterMethod,
            req.body.attributeDataType,
            req.body.attributeMaxLength
        ];
        //console.log("yes");
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }

        if (needAddoptions) {

            const sqlMax = "SELECT MAX(	Attribute_ID ) AS maxID FROM item_attribute";
            db.query(sqlMax, (err, result) => {
                if (err) {
                    console.error(err);  // Log the error to the server console
                    return res.status(500).json({ message: 'Error inside server', error: err });
                }
                console.log(result);
                let maxID = result[0].maxID;


                const sql2 = "INSERT INTO item_attribute_checkboxorradiobtn (ID, item_attribute_ID,item_Option) VALUES (?, ? , ?)";
                for (let i = 0; i < req.body.additionalOptions.length; i++) {
                    const values2 = [
                        null,
                        maxID,
                        req.body.additionalOptions[i].option
                    ];

                    db.query(sql2, values2, (err, result) => {
                        if (err) {
                            console.error(err);  // Log the error to the server console
                            return res.status(500).json({ message: 'Error inside server', error: err });
                        }

                    })
                }
            });
        }

        db.query(sqlAddColumn, (err, result) => {
            if (err) {
                console.error(err);  // Log the error to the server console
                return res.status(500).json({ message: 'Error inside server', error: err });
            }
            return res.json(result);
        });

    })
});

//delete attribute
router.post('/deleteattribute', authenticateJWT, (req, res) => {
    const sql = "DELETE FROM item_attribute WHERE Attribute_ID = ?";
    const sqlDeleteOption = "DELETE FROM item_attribute_checkboxorradiobtn WHERE item_attribute_ID = ?";
    const values = [req.body.attributeID];
    const attributeID = req.body.attributeID;
    const attributeName = req.body.attributeName;

    console.log(req.body);
    db.query(sqlDeleteOption, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }

        //delete the option

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);  // Log the error to the server console
                return res.status(500).json({ message: 'Error inside server', error: err });
            }
        });

        //drop the column
        const sqlDropColumn = "ALTER TABLE user_donate_item_details DROP COLUMN " + req.body.attributeName;
        db.query(sqlDropColumn, (err, result) => {
            if (err) {
                console.error(err);  // Log the error to the server console
                return res.status(500).json({ message: 'Error inside server', error: err });
            }
            return res.json(result);
        });
    })
});


//get the attribute data
router.get('/getattribute', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM item_attribute";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});

//get the specific attribute option data
router.get('/getspecificattributeoption/:attribute_id', authenticateJWT, (req, res) => {

    const sql = "SELECT * FROM item_attribute_checkboxorradiobtn WHERE item_attribute_ID = ?";
    const values = [req.params.attribute_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});


//update the attribute
router.post('/updateattribute', authenticateJWT, (req, res) => {
    console.log(req.body);

    let sql = "UPDATE item_attribute SET Attribute_Name = ?  WHERE Attribute_ID = ?";
    let values = [
        req.body.attributeName,
        req.body.attributeID
    ];

    //update the name of the attribute
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }


        // update the attribute name in the user_donate_item_details
        let sqlUpdateColumnName = '';
        if (req.body.attributeDataType === 'string') {
            sqlUpdateColumnName = "ALTER TABLE user_donate_item_details CHANGE COLUMN " + req.body.oldAttributeName + "  " + req.body.attributeName + "  VARCHAR(" + req.body.attributeMaxLength + ") NULL";
        } else if (req.body.attributeDataType === 'number') {
            sqlUpdateColumnName = "ALTER TABLE user_donate_item_details CHANGE COLUMN " + req.body.oldAttributeName + " " + req.body.attributeName + " int(" + req.body.attributeMaxLength + ") NULL";
        } else {
            sqlUpdateColumnName = "ALTER TABLE user_donate_item_details CHANGE COLUMN " + req.body.oldAttributeName + " " + req.body.attributeName + " date NULL";
        }

        const valuesUpdateColumnName = [
            req.body.oldAttributeName,
            req.body.attributeName
        ];

        db.query(sqlUpdateColumnName, valuesUpdateColumnName, (err, result) => {
            if (err) {
                console.error(err);  // Log the error to the server console
                return res.status(500).json({ message: 'Error inside server', error: err });
            }
        });


        if (req.body.attributeEnterMethod === "checkbox" || req.body.attributeEnterMethod === "radiobutton" || req.body.attributeEnterMethod === "select") {
            //delete the option
            const sqlDeleteOption = "DELETE FROM item_attribute_checkboxorradiobtn WHERE item_attribute_ID = ?";
            const valuesDeleteOption = [req.body.attributeID];
            db.query(sqlDeleteOption, valuesDeleteOption, (err, result) => {
                if (err) {
                    console.error(err);  // Log the error to the server console
                    return res.status(500).json({ message: 'Error inside server', error: err });
                }
            });

            //max length of option
            let max = 0;
            for (let i = 0; i < req.body.additionalOptions.length; i++) {
                if (req.body.additionalOptions[i].option.length > max) {
                    max = req.body.additionalOptions[i].option.length;
                }
            }

            let sqlUpdateColumnLength = "";
            if (req.body.attributeDataType === "string") {
                //update the column length
                sqlUpdateColumnLength = "ALTER TABLE user_donate_item_details MODIFY COLUMN " + req.body.attributeName + " VARCHAR(" + max + ") NULL";
            } else if (req.body.attributeDataType === "number") {
                //update the column length
                sqlUpdateColumnLength = "ALTER TABLE user_donate_item_details MODIFY COLUMN " + req.body.attributeName + " int(" + max + ") NULL";
            } else {
                //date
                sqlUpdateColumnLength = "ALTER TABLE user_donate_item_details MODIFY COLUMN " + req.body.attributeName + " DATE NULL";
            }

            //update Column length
            db.query(sqlUpdateColumnLength, (err, result) => {
                if (err) {
                    console.error(err);  // Log the error to the server console
                    return res.status(500).json({ message: 'Error inside server', error: err });
                }
            });

            //update the Attribute_Length
            const sqlUpdateAttributeLength = "UPDATE item_attribute SET Attribute_Length = ? WHERE Attribute_ID = ?";
            const valuesUpdateAttributeLength = [max, req.body.attributeID];
            db.query(sqlUpdateAttributeLength, valuesUpdateAttributeLength, (err, result) => {
                if (err) {
                    console.error(err);  // Log the error to the server console
                    return res.status(500).json({ message: 'Error inside server', error: err });
                }
            });

            //add the option
            const sqlAddOption = "INSERT INTO item_attribute_checkboxorradiobtn (ID, item_attribute_ID,item_Option) VALUES (?, ? , ?)";
            for (let i = 0; i < req.body.additionalOptions.length; i++) {
                const valuesAddOption = [
                    null,
                    req.body.attributeID,
                    req.body.additionalOptions[i].option
                ];

                db.query(sqlAddOption, valuesAddOption, (err, result) => {
                    if (err) {
                        console.error(err);  // Log the error to the server console
                        return res.status(500).json({ message: 'Error inside server', error: err });
                    }

                })
            }
        }

        return res.json(result);
    })
});

//add new classification
router.post('/addnewclassification', authenticateJWT, (req, res) => {
    console.log(req.body);
    const sql = "INSERT INTO item_classification (classification_ID   , classification_Name) VALUES (?, ?)";
    const values = [
        null,
        req.body.categoryName
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        console.log(result);

        const sql2 = "INSERT INTO item_classificationattribute (ID , classification_ID , Attribute_ID) VALUES (?, ? , ?)";
        for (let i = 0; i < req.body.attributes.length; i++) {

            //query the attribute id
            const sql3 = "SELECT Attribute_ID FROM item_attribute WHERE Attribute_Name = ?";
            const values3 = [req.body.attributes[i].name];
            console.log("values3");
            console.log(values3);
            db.query(sql3, values3, (err, result3) => {
                if (err) {
                    console.error("Bug!!!!!");
                    console.error(err);  // Log the error to the server console
                    return res.status(500).json({ message: 'Error inside server', error: err });
                }
                console.log(result3);
                const values2 = [
                    null,
                    result.insertId,
                    result3[0].Attribute_ID
                ];

                db.query(sql2, values2, (err, result2) => {
                    if (err) {
                        console.error(err);  // Log the error to the server console
                        return res.status(500).json({ message: 'Error inside server', error: err });
                    }
                })
            })
        }
        return res.json(result);


    })
});

//get classification data (ID)
router.get('/getclassificationdata/:id', authenticateJWT, (req, res) => {
    const sql = `
    SELECT
        classification_Name
    FROM 
        item_classification
    WHERE
        classification_ID = ?
    `;
    const values = [req.params.id];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error inside server', error: err });
        } else {
            res.json(results);
        }
    });
});

//edit classification 
router.post('/editclassification/:id', authenticateJWT, (req, res) => {
    const sqlUpdate = `
    UPDATE 
        item_classification
    SET
        classification_Name = ?
    WHERE
        classification_ID = ?
    `;

    const valuesUpdate = [req.body.categoryName, req.params.id]
    db.query(sqlUpdate, valuesUpdate, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error inside server', error: err });
        } else {

            const sqlDelete = `
            DELETE FROM 
                item_classificationattribute
            WHERE
                classification_ID  = ?
            `;

            const valuesDelete = [req.params.id]
            db.query(sqlDelete, valuesDelete, (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Error inside server', error: err });
                } else {
                    //get the attribute id
                    for (let i = 0; i < req.body.attributes.length; i++) {
                        const sql3 = "SELECT Attribute_ID FROM item_attribute WHERE Attribute_Name = ?";
                        const values3 = [req.body.attributes[i].name];
                        console.log(values3);
                        db.query(sql3, values3, (err, result3) => {
                            if (err) {
                                console.error(err);  // Log the error to the server console
                                return res.status(500).json({ message: 'Error inside server', error: err });
                            }
                            console.log(result3);
                            const values2 = [
                                null,
                                req.params.id,
                                result3[0].Attribute_ID
                            ];

                            const insertSql = `
                        INSERT INTO
                            item_classificationattribute
                        VALUES
                            (?, ?, ?)
                        `;

                            db.query(insertSql, values2, (err, result2) => {
                                if (err) {
                                    console.error(err);  // Log the error to the server console
                                    return res.status(500).json({ message: 'Error inside server', error: err });
                                }
                            })
                        })
                    }
                    return res.json(results);
                }
            });

        }
    });


});

//get classification'attribute (ID)
router.get('/getspecificclassification/:id', authenticateJWT, (req, res) => {
    console.log(req.params.id);
    const sql = `
    SELECT 
        ia.Attribute_Name, 
        ia.Attribute_Type, 
        ia.Attribute_DataType, 
        ia.Attribute_Length,
        GROUP_CONCAT(iacor.item_Option SEPARATOR ', ') AS options
    FROM 
        item_classification ic
        JOIN item_classificationattribute ica ON ic.classification_ID = ica.classification_ID
        JOIN item_attribute ia ON ica.Attribute_ID = ia.Attribute_ID
        LEFT JOIN item_attribute_checkboxorradiobtn iacor ON ia.Attribute_ID = iacor.item_attribute_ID
    WHERE 
        ic.classification_ID  = ?   
    GROUP BY 
        ia.Attribute_ID;
    `;
    const values = [req.params.id];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        console.log(results);
        return res.json(results);
    })
});

//get classification data (Name)
router.get('/getclassification/:name', authenticateJWT, (req, res) => {
    // SQL query to get classification attributes and their options if they are of type 'radiobutton' or 'checkbox'
    const sql = `
    SELECT 
        ia.Attribute_Name, 
        ia.Attribute_Type, 
        ia.Attribute_DataType, 
        ia.Attribute_Length,
        GROUP_CONCAT(iacor.item_Option SEPARATOR ', ') AS options
    FROM 
        item_classification ic
        JOIN item_classificationattribute ica ON ic.classification_ID = ica.classification_ID
        JOIN item_attribute ia ON ica.Attribute_ID = ia.Attribute_ID
        LEFT JOIN item_attribute_checkboxorradiobtn iacor ON ia.Attribute_ID = iacor.item_attribute_ID
    WHERE 
        ic.classification_Name = ?
    GROUP BY 
        ia.Attribute_ID;
    `;
    //console.log("yes");
    const values = [req.params.name];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error("Bug!!!!!");
            console.error(err);  // Log the error to the server console
            res.status(500).json({ message: 'Error inside server', error: err });
        } else {
            // Process the results to include the options in the JSON response
            const processedResults = results.map(row => {
                if (row.Attribute_Type === 'radiobutton' || row.Attribute_Type === 'checkbox' || row.Attribute_Type === 'select') {
                    // Split the options string back into an array
                    row.options = row.options ? row.options.split(', ') : [];
                } else {
                    // If not a 'radiobutton' or 'checkbox', remove the options property
                    delete row.options;
                }
                return row;
            });
            //console.log(processedResults);
            res.json(processedResults);
        }
    });
});




const azureCheckText = (userID, itemName, ritemDescribeeq, meetUpLocation, mailingAndDeliveryMethod, user_id) => {
    return new Promise((resolve, reject) => {
        const text = itemName + "\n" + ritemDescribeeq + "\n" + meetUpLocation + "\n" + mailingAndDeliveryMethod;
        console.log(text);

        axios.post(`${env.ai.serviceBaseUrl}/azure_text`, { text: text }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log(response.data);
            const categoriesAnalysis = response.data.categoriesAnalysis;

            const sql = "SELECT * FROM ai_text_setting";
            db.query(sql, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(result);
                    const { block, message } = shouldBlock(categoriesAnalysis, result, 'text');
                    console.log(block ? "Should block" : "No need to block", message); // Adjusted output for clarity

                    // 建立映射
                    const severityMap = {};
                    categoriesAnalysis.forEach(category => {
                        severityMap[category.category] = category.severity;
                    });

                    // 預設所有類別的嚴重性為0
                    const defaultSeverity = {
                        Hate: 0,
                        SelfHarm: 0,
                        Sexual: 0,
                        Violence: 0
                    };

                    // 更新映射中對應類別的嚴重性
                    Object.keys(defaultSeverity).forEach(category => {
                        if (severityMap.hasOwnProperty(category)) {
                            defaultSeverity[category] = severityMap[category];
                        }
                    });

                    let blockint = block == true ? 1 : 0;

                    // 準備SQL INSERT語句的參數
                    const values = [
                        null, // ID
                        userID, // User_ID
                        null, // Checktime
                        text, // Text_Content
                        defaultSeverity.Hate, // Text_Hate
                        defaultSeverity.SelfHarm, // Text_SelfHarm
                        defaultSeverity.Sexual, // Text_Sexual
                        defaultSeverity.Violence, // Text_Violence
                        blockint
                    ];

                    // 執行SQL INSERT語句
                    const sqlINSERTResult = "INSERT INTO ai_text_result (ID,User_ID, Checktime, Text_Content , Text_Hate, Text_SelfHarm, Text_Sexual, Text_Violence ,Block) VALUES (?,?, ?, ?, ?, ?, ?, ? ,? )";
                    db.query(sqlINSERTResult, values, (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            console.log(result);
                            // 繼續後續處理...
                        }
                    });


                    resolve({ block, message }); // Resolve the promise with the block value
                }
            });

        }).catch((error) => {
            console.log("This is the error.");
            console.error(error);
            reject(error); // Reject the promise if there's an error
        });
    });
};

const readFile = util.promisify(fs.readFile);
const azureCheckImage = async (files, user_id) => {
    return new Promise(async (resolve, reject) => {
        if (files.length === 0) {
            console.log("No files provided");
            reject(new Error("No files provided"));
            return;
        }

        let blockResultPromises = files.map(file => {
            return new Promise(async (innerResolve, innerReject) => {
                try {
                    // 讀取圖片
                    const data = await readFile(file.path);

                    // 使用sharp調整圖片尺寸
                    const resizedImageBuffer = await sharp(data)
                        .resize({ height: 2048, width: 2048, withoutEnlargement: true }) // 調整尺寸但不放大
                        .toBuffer();

                    // 轉換為Base64字符串
                    const base64String = resizedImageBuffer.toString('base64');

                    // 發送POST請求到API
                    const response = await axios.post(`${env.ai.serviceBaseUrl}/azure_image`, JSON.stringify({ content: base64String }), {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const categoriesAnalysis = response.data.categoriesAnalysis;
                    const sql = "SELECT * FROM ai_image_setting";
                    console.log(categoriesAnalysis);
                    db.query(sql, (err, result) => {
                        if (err) {
                            console.error(err);
                            innerReject(err);
                        } else {
                            const { block, message } = shouldBlock(categoriesAnalysis, result, "picture");
                            console.log(block ? "Should block" : "No need to block", message); // Adjusted output for clarity
                            innerResolve({ block, message, categoriesAnalysis }); // Resolve with all relevant info
                        }
                    });
                } catch (error) {
                    console.error("Error processing the file", error);
                    innerReject(error);
                }
            });
        });



        // 使用Promise.all等待所有圖片處理完成
        Promise.all(blockResultPromises).then(blockResults => {
            //console.log(blockResults); // 此時results是所有文件處理結果的陣列

            // 檢查是否有圖片被block
            const isAnyImageBlocked = blockResults.some(result => result.block === "Should block");
            if (isAnyImageBlocked) {

            }



            // 準備SQL INSERT語句的參數
            const values = [
                null, // ID
                user_id, // User_ID
                null, // Checktime
            ];

            const sqlINSERTResult = "INSERT INTO ai_image_result (ID,User_ID, Checktime) VALUES (?,?, ?)";
            db.query(sqlINSERTResult, values, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    const sqlINSERTResult = "INSERT INTO ai_image_result_photo (ID,Photo_ID , Photo_Path,Image_Hate ,Image_SelfHarm ,Image_Sexual , Image_Violence ,Block) VALUES (?,?, ?,?,?,?,? ,?)";
                    console.log(result);
                    for (let i = 0; i < blockResults.length; i++) {
                        const blockint = blockResults[i].block == true ? 1 : 0;
                        console.log("This is the blockint");
                        console.log(blockResults[i].block);
                        console.log(blockint);
                        if (isAnyImageBlocked) {
                            // 構建原始文件的路徑和目標文件夾的路徑
                            const originalPath = files[i].path;
                            const fileName = path.basename(originalPath);
                            const newPath = path.join('violationIMG', fileName);
                            console.log(newPath);
                            // 移動文件
                            fs.move(originalPath, newPath, err => {
                                if (err) return console.error(err);
                                console.log(`文件已移動到${newPath}`);
                            });
                            files[i].path = newPath;
                        }


                        const values = [
                            result.insertId, // ID
                            i + 1, //Photo ID
                            files[i].path, // photo path
                            blockResults[i].categoriesAnalysis[0].severity,
                            blockResults[i].categoriesAnalysis[1].severity,
                            blockResults[i].categoriesAnalysis[2].severity,
                            blockResults[i].categoriesAnalysis[3].severity,
                            blockint,//
                        ];
                        db.query(sqlINSERTResult, values, (err, result) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                console.log(result);
                            }
                        });
                    }

                }
            });

            resolve(blockResults); // 解析主Promise
        }).catch(error => {
            reject(error);
        });
    });
};




// 函数用于判断是否有任何 category 的 severity 大于或等于 judgement 且 open
const shouldBlock = (categoriesAnalysis, result, type) => {
    // 将结果转换为更容易查询的格式
    const settingsMap = result.reduce((acc, curr) => {
        acc[curr.ID] = { open: curr.open, judgement: curr.judgement };
        return acc;
    }, {});

    // 遍历 categoriesAnalysis 并应用逻辑
    for (const category of categoriesAnalysis) {
        const setting = settingsMap[category.category];

        if (setting && setting.open === '1' && category.severity >= setting.judgement) {
            return {
                block: true,
                message: `The ${type} contains ${category.category} elements`
            };
        }
    }
    return { block: false, message: "No need to block" };
};




//android user add donate item
router.post('/UserAddDonateItem', uploadDonateIMG.array('imageFiles', 5), authenticateJWT, async (req, res) => {

    console.log(req.body);

    // Check if any files are uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No images were uploaded.');
    }

    const {
        userID,
        itemName,
        itemType,
        itemStatus,
        itemDescribe,
        meetUpBoolean,
        mailingAndDeliveryBoolean,
        meetUpLocation,
        mailingAndDeliveryMethod,
        ...otherKeys
    } = req.body;


    // Text content check
    const textResult = await azureCheckText(userID, itemName, itemDescribe, meetUpLocation, mailingAndDeliveryMethod);
    if (textResult.block) { // Assuming block is a boolean now
        console.log("Your donation item was blocked by the system");
        return res.status(403).json({ message: textResult.message });
    }


    // Image content check
    const imageResult = await azureCheckImage(req.files, userID);
    const blockedImage = imageResult.find(img => img.block); // Assuming imageResult is an array of { block, message }
    if (blockedImage) {
        console.log("Your donation item was blocked by the system");
        return res.status(403).json({ message: blockedImage.message });
    }


    /*
    if (true) {
        console.log("This is testing");
        return res.status(403).json({ message: "Maybe forget close testing" });
    }
    */

    // 过滤掉值为"please select"的键值对
    const filteredKeys = Object.entries(otherKeys).filter(([key, value]) => value !== 'please select' && value !== '');

    // 创建两个常量数组，分别存储过滤后的键和值
    const remainingKeys = filteredKeys.map(entry => entry[0]);
    const remainingValues = filteredKeys.map(entry => entry[1]);

    // 查看剩余的键和值
    console.log('Remaining Keys:', remainingKeys);
    console.log('Remaining Values:', remainingValues);


    const sql = "INSERT INTO user_donate_item (Donate_Item_ID , Donate_Item_Name, Donate_Item_type, Donate_User_ID, Donate_Item_Post_Date ,Donate_Item_Status,Donate_Status,Donate_Item_Violation,Donate_Item_Describe,Donate_Item_Location,Donate_Item_Meetup , Donate_Item_MailingDelivery ,Donate_Item_MeetupLocation , Donate_Item_MailingDeliveryMethod  ) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?,? ,?,?,?)";



    const values = [
        null,
        req.body.itemName,
        req.body.itemType,
        req.body.userID,
        null,
        req.body.itemStatus,
        "Available",
        0,
        req.body.itemDescribe,
        // req.body.itemLocation,
        "HK",
        req.body.meetUpBoolean,
        req.body.mailingAndDeliveryBoolean,
        req.body.meetUpLocation,
        req.body.mailingAndDeliveryMethod
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        const sql2 = "SELECT MAX(Donate_Item_ID) AS donateID  FROM user_donate_item";


        db.query(sql2, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            let donateID;
            if (result.length > 0 && result[0].donateID != null) {
                donateID = result[0].donateID;
            } else {
                donateID = 1;  // Set donateID to 1 if no results or the result is null
            }

            const sql3 = "INSERT INTO donate_photos (Donate_Item_ID , Donate_Photo_ID ,Donate_Photo) VALUES (?, ? , ?)";

            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    let values3 = [
                        donateID,
                        i + 1,
                        req.files[i].path    // 文件的路径
                    ];
                    db.query(sql3, values3, (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json(err);
                        }
                    });
                }
            }

            if (remainingKeys.length > 0) {
                // 将键和值组合成SQL插入语句的一部分
                const columns = remainingKeys.join(', ');
                const placeholders = remainingValues.map(() => '?').join(', '); // 为每个值创建一个占位符

                // 假设你的表名为 user_donate_item_details
                // 添加 Item_details_ID 和对应的 donationID 到列和值中
                const sql4 = `INSERT INTO user_donate_item_details (Item_details_ID , ${columns}) VALUES (?, ${placeholders})`;
                const values4 = [donateID, ...remainingValues]; // 将donationID添加到值数组的开头

                // 执行SQL插入操作
                db.query(sql4, values4, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json(err);
                    }
                });
            } else {

                const sql5 = `INSERT INTO user_donate_item_details (Item_details_ID) VALUES (?)`;
                const values5 = [donateID]; // 将donationID添加到值数组的开头

                // 执行SQL插入操作
                db.query(sql5, values5, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json(err);
                    }
                });

            }
            res.status(200).json({ message: "Donation was successful" });

        });
    });
});


//Android user delete the donate item
router.post('/androiduserdeletedonateitem/:donate_id', authenticateJWT, (req, res) => {
    const sql = "UPDATE user_donate_item SET Donate_Status = 'Deleted' WHERE Donate_Item_ID = ?";
    const values = [req.params.donate_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
});


//Android donate item data latest(Explore page)
router.post('/androiddonatedatalastes/:user_id', authenticateJWT, (req, res) => {
    console.log("Explore page");
    console.log(req.params.user_id);
    const sql = `
    SELECT 
    dp.Donate_Item_ID, 
    MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
    MIN(dp.Donate_Photo) AS First_Photo,
    udi.Donate_User_ID,
    udi.Donate_Item_Name,
    u.User_image,
    MAX(CASE WHEN uc.User_collectID IS NOT NULL THEN 'Collected' ELSE 'Not Collected' END) AS Collection_Status
FROM 
    donate_photos dp
JOIN 
    user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
JOIN
    user u ON udi.Donate_User_ID = u.ID
LEFT JOIN
    user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID AND uc.User_ID = ?
WHERE 
    udi.Donate_Item_Violation = 0 AND udi.Donate_Status = 'Available'
GROUP BY 
    dp.Donate_Item_ID, udi.Donate_User_ID, udi.Donate_Item_Name, u.User_image
ORDER BY
    dp.Donate_Item_ID DESC;
  `;

    const values = [req.params.user_id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });

})

//User collect item data
router.post('/Usercollectitemdata/:user_id', authenticateJWT, (req, res) => {
    const sql = `
    SELECT 
    dp.Donate_Item_ID, 
    MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
    MIN(dp.Donate_Photo) AS First_Photo,
    udi.Donate_User_ID,
    udi.Donate_Item_Name,
    u.User_image,
    'Collected' AS Collection_Status
FROM 
    donate_photos dp
JOIN 
    user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
JOIN
    user u ON udi.Donate_User_ID = u.ID
JOIN
    user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID
WHERE 
    uc.User_ID = ?
GROUP BY 
    dp.Donate_Item_ID
    `;
    const values = [req.params.user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });

})

//Android user see the Me page Donation item data (profile page)
router.post('/androiduserseethemedonationitemdata/:user_id', authenticateJWT, (req, res) => {
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
        udi.Donate_User_ID = ? AND udi.Donate_Item_Violation = 0 AND udi.Donate_Status != 'Deleted'
    GROUP BY 
        dp.Donate_Item_ID
    Order BY
    dp.Donate_Item_ID DESC
    `;
    const values = [req.params.user_id, req.params.user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });

});


router.post('/androiduserseetheanothermedonationitemdata/:user_id/:anotheruser_id', authenticateJWT, (req, res) => {
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
        udi.Donate_User_ID = ? AND udi.Donate_Item_Violation = 0 AND udi.Donate_Status != 'Deleted'
    GROUP BY 
        dp.Donate_Item_ID
    Order BY
    dp.Donate_Item_ID DESC
    `;
    const values = [req.params.anotheruser_id, req.params.user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });

});



// Android user image search item data
router.post('/androiduserimagesearchitemdata/:user_id', (req, res) => {
    console.log(req.body);

    const requestBody = req.body;

    // Convert the request body to an array of key-value pairs
    const keyValuePairs = Object.entries(requestBody);

    // Sort the key-value pairs based on the value in descending order
    keyValuePairs.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

    // Get the keys from the sorted key-value pairs
    const sortedKeys = keyValuePairs.map(pair => pair[0]);

    // Filter the keys based on the condition value > 0.4
    const keysGreaterThan0_4 = sortedKeys.filter(key => parseFloat(requestBody[key]) > 0.4);

    console.log(keysGreaterThan0_4);

    const sql = `
    SELECT
    dp.Donate_Item_ID,
    MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
    MIN(dp.Donate_Photo) AS First_Photo,
    udi.Donate_User_ID,
    udi.Donate_Item_Name,
    u.User_image,
    MAX(CASE
        WHEN uc.User_collectID IS NOT NULL THEN 'Collected'
        ELSE 'Not Collected'
    END) AS Collection_Status
FROM
    donate_photos dp
JOIN
    user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
JOIN
    user u ON udi.Donate_User_ID = u.ID
LEFT JOIN
    user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID AND uc.User_ID = ?
WHERE
    ${keysGreaterThan0_4.map(key => `dp.Donate_Photo LIKE '%${key}%'`).join(' OR ')}
GROUP BY
    dp.Donate_Item_ID, udi.Donate_User_ID, udi.Donate_Item_Name, u.User_image
ORDER BY
    FIELD(dp.Donate_Photo, ${keysGreaterThan0_4.map(key => `'uploadDonateIMG\\\\${key}'`).join(',')});
    `;

    const values = [req.params.user_id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        console.log(result);
        return res.json(result);
    });
});

//Android get the user collect specific item data
router.get('/androidgetusercollectspecificitemdata/:user_id/:donate_id', (req, res) => {
    console.log(req.params.user_id);
    console.log(req.params.donate_id);

    const sql = `
    SELECT COUNT(*) AS nums FROM user_collect WHERE User_ID = ? AND Donate_ID = ?
        `
    const values = [req.params.user_id, req.params.donate_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        } else {
            console.log(result[0]);
            return res.json(result[0]);
        }

    });


});



//Android user collect or delect the item 
router.post('/UserCollectDelectItem', authenticateJWT, (req, res) => {

    const sqlINSERT = "INSERT INTO user_collect (User_collectID  , User_ID , Donate_ID ) VALUES (0 , ?, ?)";
    const sqlDELETE = "DELETE FROM user_collect WHERE User_ID = ? AND Donate_ID = ?";

    let values = [
        req.body.User_ID,
        req.body.Donate_Item_ID,
    ];


    if (req.body.Collect_Item_Status == 1) {
        db.query(sqlINSERT, values, (err, result) => {
            if (err) {
                console.error("sqlINSERT: " + err);
                return res.status(500).json(err);
            }
            console.log("insert");
            return res.json(result);
        });
    } else {
        db.query(sqlDELETE, values, (err, result) => {
            if (err) {
                console.error("sqlDELETE: " + err);
                return res.status(500).json(err);
            }
            console.log("delete");
            return res.json(result);
        });
    }

})


//android insert user search item record
router.post('/androidinsertusersearchitemrecord/:query/:userID', authenticateJWT, (req, res) => {
    const sql = "INSERT INTO user_search_record (ID ,User_ID, Search_content , Search_DateTime) VALUES (? , ?, ?, ?)";
    const values = [
        null,
        req.params.userID,
        req.params.query,
        null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });
});

//android get user search item record
router.get('/androidgetusersearchitemrecord/:userID', authenticateJWT, (req, res) => {

    const sql = "SELECT ID , Search_content FROM user_search_record WHERE User_ID = ? ORDER BY Search_DateTime DESC";
    const values = [req.params.userID];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        return res.json(result);
    });
});

//android delete user search item record
router.post('/androiddeleteusersearchitemrecord/:recordID', authenticateJWT, (req, res) => {
    const sql = "DELETE FROM user_search_record WHERE ID = ?";
    const values = [req.params.recordID];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });
});


// android search item
router.post('/androidsearchitem/:userID/:query/:otherquery', authenticateJWT, (req, res) => {
    console.log(req.params.userID);
    console.log('-----------------');
    console.log(req.params.query);
    console.log(req.params.otherquery);

    let queryParams = req.params.otherquery.split(',');

    if (queryParams[0] == 'old_to_new') {
        queryParams[0] = 'ASC';
    } else {
        queryParams[0] = 'DESC';
    }

    if (queryParams[1] == 'Please select') {
        queryParams[1] = '';
    }

    if (queryParams[2] == 'Please select') {
        queryParams[2] = '';
    }

    if (queryParams[3] == 'Please select') {
        queryParams[3] = '';
    }

    if (req.params.query == 'empty query') {
        req.params.query = '';
    }

    console.log(queryParams[2]);

    const sql = `
    SELECT
    dp.Donate_Item_ID,
    MIN(dp.Donate_Photo_ID) AS First_Photo_ID,
    MIN(dp.Donate_Photo) AS First_Photo,
    udi.Donate_User_ID,
    udi.Donate_Item_Name,
    u.User_image,
    CASE
        WHEN uc.User_collectID IS NOT NULL THEN 'Collected'
        ELSE 'Not Collected'
    END AS Collection_Status
FROM
    donate_photos dp
JOIN
    user_donate_item udi ON dp.Donate_Item_ID = udi.Donate_Item_ID
JOIN
    user u ON udi.Donate_User_ID = u.ID
LEFT JOIN
    user_collect uc ON udi.Donate_Item_ID = uc.Donate_ID AND uc.User_ID = ?
WHERE
    udi.Donate_Item_Name LIKE ? And udi.Donate_Item_type LIKE ?  And udi.Donate_Item_Violation = 0 AND udi.Donate_Status != 'Deleted'
GROUP BY
    dp.Donate_Item_ID, udi.Donate_User_ID, udi.Donate_Item_Name, u.User_image
ORDER BY
    dp.Donate_Item_ID ${queryParams[0]};
        `;

    const values = [req.params.userID, `%${req.params.query}%`, `%${queryParams[3]}%`];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        console.log(result);
        return res.json(result);
    })
});






  return router;
}
