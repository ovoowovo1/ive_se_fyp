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

//All announcement data
router.post('/AllAnnouncementData', authenticateJWT, (req, res) => {
    const sql = `
      SELECT announcement.*, admin.Admin_Name AS Name
      FROM announcement
      LEFT JOIN admin ON announcement.Announcement_AdminID = admin.Admin_ID
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});

//Admin publish announcement
router.post('/AdminPublishAnnouncement', authenticateJWT, uploadAnnouncement.single('Announcement_Image'), (req, res) => {
    const sql = "INSERT INTO announcement (Announcement_ID ,Announcement_AdminID ,Announcement_Image ,  Announcement_Title, Announcement_Content, Announcement_DateTime ,Announcement_On_Shelf_Status) VALUES (?, ?, ?, ?, ? , ?,?)";

    const file = req.file;

    const values = [
        0,
        req.body.adminID,
        file?.path || null,
        req.body.announcementTitle,
        req.body.announcementContent,
        new Date(),
        1];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(result);
    });

})

//Specify announcement data
router.get('/SpecifyAnnouncementData/:announcement_id', authenticateJWT, (req, res) => {
    const sql = `
      SELECT announcement.*, admin.Admin_Name AS Name
      FROM announcement
      LEFT JOIN admin ON announcement.Announcement_AdminID = admin.Admin_ID
      WHERE announcement.Announcement_ID = ?
    `;
    const values = [req.params.announcement_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result[0]);
    })
});

//Admin update announcement status
router.post('/AdminUpdateAnnouncementStatus', authenticateJWT, (req, res) => {
    const sql = "UPDATE announcement SET Announcement_On_Shelf_Status = ? WHERE Announcement_ID = ?";
    const values = [req.body.Announcement_On_Shelf_Status, req.body.Announcement_ID];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    }
    )
});

//Admin Edit announcement
router.post('/AdminEditAnnouncement', authenticateJWT, uploadAnnouncement.single('Announcement_Image'), (req, res) => {
    let sql = "UPDATE announcement SET Announcement_Title = ? , Announcement_Content = ?";
    const values = [req.body.Announcement_Title, req.body.Announcement_Content];

    if (req.file?.path) {
        sql += " , Announcement_Image = ?";
        values.push(req.file.path);
    }

    sql += " WHERE Announcement_ID = ?";
    values.push(req.body.Announcement_ID);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});



//Android get all announcement data
router.get('/androidgetallannouncementdata', authenticateJWT, (req, res) => {
    const sql = "SELECT * FROM announcement WHERE Announcement_On_Shelf_Status = '1' ORDER BY Announcement_DateTime DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);  // Log the error to the server console
            return res.status(500).json({ message: 'Error inside server', error: err });
        }
        return res.json(result);
    })
});




  return router;
}
