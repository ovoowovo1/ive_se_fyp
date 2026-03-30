import express from 'express';

const normalizePermissions = (permissions) => {
  const values = Array.isArray(permissions) ? permissions : permissions ? [permissions] : [];

  return {
    isUser: values.includes('user') ? 1 : 0,
    isAdmin: values.includes('admin') ? 1 : 0,
    isAnalysis: values.includes('analysis') ? 1 : 0,
    isDonate: values.includes('donate') ? 1 : 0,
    isAnnouncement: values.includes('announcement') ? 1 : 0,
    isViolation: values.includes('violation') ? 1 : 0,
  };
};

const handleRequest = (db, requiredPermission, sqlQuery) => (req, res) => {
  if (req.user[requiredPermission] !== 1) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  db.query(sqlQuery, (error, result) => {
    if (error) {
      return res.json({ Message: 'Error inside server' });
    }

    return res.json(result);
  });
};

export default function createAdminUsersRouter(context) {
  const router = express.Router();
  const { authenticateJWT, db, env, hashPassword, jwt, queryAsync, uploads, util, withTransaction } =
    context;
  const { upload, uploadAdminIMG } = uploads;

  router.get(
    '/',
    authenticateJWT,
    handleRequest(
      db,
      'Admin_Permission_User',
      'SELECT ID,Name,User_Create_Date,User_image,is_suspended FROM user',
    ),
  );

  router.get(
    '/listadmindata',
    authenticateJWT,
    handleRequest(
      db,
      'Admin_Permission_Admin',
      "SELECT Admin_ID ,Admin_Name ,Admin_Suspended ,  Admin_Photo FROM admin WHERE Admin_ID != 'root'",
    ),
  );

  router.post('/createuser', async (req, res) => {
    try {
      const sql =
        'INSERT INTO user (ID, Name, is_suspended, password, User_Email ,User_Create_Date) VALUES (?, ?, ?, ?, ?, ?)';
      const todayDate = new Date().toISOString().split('T')[0];
      const hashedPassword = await hashPassword(req.body.password);
      const values = [
        req.body.UserID,
        req.body.Name,
        0,
        hashedPassword,
        req.body.User_Email,
        todayDate,
      ];

      const result = await queryAsync(sql, values);
      const token = jwt.sign(
        {
          uid: req.body.UserID,
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn },
      );

      result.token = token;
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  router.post('/createadmin', authenticateJWT, uploadAdminIMG.single('Admin_Photo'), async (req, res) => {
    try {
      const existingAdmin = await queryAsync('Select Admin_ID from admin Where Admin_ID = (?)', [
        req.body.Admin_ID,
      ]);

      if (existingAdmin.length > 0) {
        return res.status(409).json({ status: 409, msg: 'Admin ID already exists' });
      }

      const hashedPassword = await hashPassword(req.body.Admin_Password);
      const permissions = normalizePermissions(req.body['permission-group']);

      const result = await withTransaction(async (connection) => {
        const connectionQuery = util.promisify(connection.query).bind(connection);

        await connectionQuery(
          'INSERT INTO admin (Admin_ID , Admin_Password, Admin_Name ,Admin_Contact_Number ,Admin_Email,Admin_Job_Title,Admin_Create_Date,Admin_Photo) VALUES (?, ?, ? , ? , ?,? , ? , ?)',
          [
            req.body.Admin_ID,
            hashedPassword,
            req.body.Admin_Name,
            req.body.Admin_Contact_Number,
            req.body.Admin_Email,
            req.body.Admin_Job_Title,
            new Date(),
            req.file?.path || null,
          ],
        );

        return connectionQuery(
          'INSERT INTO admin_permission (Admin_Permission_ID  , Admin_Permission_User, Admin_Permission_Admin , Admin_Permission_Analysis ,Admin_Permission_Donate , Admin_Permission_Announcement ,Admin_Permission_Violation  ) VALUES (?, ?, ?, ? ,? ,? ,?  )',
          [
            req.body.Admin_ID,
            permissions.isUser,
            permissions.isAdmin,
            permissions.isAnalysis,
            permissions.isDonate,
            permissions.isAnnouncement,
            permissions.isViolation,
          ],
        );
      });

      return res
        .status(201)
        .json({ status: 201, msg: 'User created successfully', data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, msg: 'Internal Server Error', error });
    }
  });

  router.get('/user/:user_id', authenticateJWT, async (req, res) => {
    try {
      const result = await queryAsync(
        'SELECT  ID,Name , is_suspended ,User_Create_Date,User_Email,User_Contact_Number , User_image ,User_AboutMe,User_Birthday ,User_Location, User_Gender FROM user  WHERE ID = ? ',
        [req.params.user_id],
      );

      if (!result.length) {
        return res.status(404).json({ status: 404, msg: 'Admin not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, msg: 'Internal Server Error', error });
    }
  });

  router.get('/user2/:user_id', async (req, res) => {
    try {
      const result = await queryAsync(
        'SELECT  ID,Name , is_suspended ,User_Create_Date FROM user  WHERE ID = ? ',
        [req.params.user_id],
      );

      if (!result.length) {
        return res.status(404).json({ status: 404, msg: 'Admin not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, msg: 'Internal Server Error', error });
    }
  });

  router.get('/user/:user_id/donateitem', authenticateJWT, async (req, res) => {
    try {
      const result = await queryAsync(
        `SELECT 
          udi.Donate_Item_ID, 
          udi.Donate_Item_Name, 
          udi.Donate_Item_type, 
          udi.Donate_Item_Describe, 
          udi.Donate_Item_Location, 
          MIN(dp.Donate_Photo) AS First_Donate_Photo
        FROM 
          user_donate_item udi
        JOIN 
          donate_photos dp ON udi.Donate_Item_ID = dp.Donate_Item_ID
        WHERE 
          udi.Donate_User_ID = ?
        GROUP BY 
          udi.Donate_Item_ID`,
        [req.params.user_id],
      );

      if (!result.length) {
        return res.status(404).json({ status: 404, msg: 'Admin not found' });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, msg: 'Internal Server Error', error });
    }
  });

  router.get('/admin/:admin_id', authenticateJWT, async (req, res) => {
    try {
      const result = await queryAsync(
        'SELECT * FROM admin , admin_permission  WHERE Admin_ID = ? and Admin_ID =  Admin_Permission_ID\t',
        [req.params.admin_id],
      );

      if (!result.length) {
        return res.status(404).json({ status: 404, msg: 'Admin not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, msg: 'Internal Server Error', error });
    }
  });

  router.post(
    '/editadmindata/:admin_id',
    authenticateJWT,
    uploadAdminIMG.single('Admin_Photo'),
    async (req, res) => {
      try {
        const permissions = normalizePermissions(req.body['permission-group']);

        await withTransaction(async (connection) => {
          const connectionQuery = util.promisify(connection.query).bind(connection);
          let sql =
            'UPDATE admin SET Admin_Name = ?, Admin_Contact_Number = ?, Admin_Email = ?, Admin_Job_Title = ?';
          const values = [
            req.body.Admin_Name,
            req.body.Admin_Contact_Number,
            req.body.Admin_Email,
            req.body.Admin_Job_Title,
          ];

          if (req.file) {
            sql += ', Admin_Photo = ?';
            values.push(req.file.path);
          }

          sql += ' WHERE Admin_ID = ?';
          values.push(req.params.admin_id);

          await connectionQuery(sql, values);
          await connectionQuery(
            'UPDATE admin_permission SET Admin_Permission_User = ?, Admin_Permission_Admin = ?, Admin_Permission_Analysis = ? ,Admin_Permission_Donate = ? , Admin_Permission_Announcement = ? , Admin_Permission_Violation = ?   WHERE Admin_Permission_ID = ?',
            [
              permissions.isUser,
              permissions.isAdmin,
              permissions.isAnalysis,
              permissions.isDonate,
              permissions.isAnnouncement,
              permissions.isViolation,
              req.params.admin_id,
            ],
          );
        });

        return res.status(200).json({ status: 200, msg: 'Admin data updated successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json(error);
      }
    },
  );

  router.post('/editUserdata/:user_id', authenticateJWT, upload.single('User_image'), async (req, res) => {
    try {
      const gender = req.body.User_Gender === 'Select Gender' ? null : req.body.User_Gender;
      let sql;
      let values;

      if (!req.file) {
        sql =
          'UPDATE user SET Name = ?, User_Email = ?, User_Contact_Number = ? , User_Birthday = ? , User_AboutMe = ? ,User_Location = ? , User_Gender = ?  WHERE ID = ?';
        values = [
          req.body.Name,
          req.body.User_Email,
          req.body.User_Contact_Number,
          req.body.User_Birthday,
          req.body.User_AboutMe,
          req.body.User_Location,
          gender,
          req.params.user_id,
        ];
      } else {
        sql =
          'UPDATE user SET Name = ?, User_Email = ?, User_Contact_Number = ?, User_image = ?, User_Birthday = ?  , User_AboutMe = ? ,User_Location = ? ,User_Gender = ? WHERE ID = ?';
        values = [
          req.body.Name,
          req.body.User_Email,
          req.body.User_Contact_Number,
          req.file.path,
          req.body.User_Birthday,
          req.body.User_AboutMe,
          req.body.User_Location,
          gender,
          req.params.user_id,
        ];
      }

      await queryAsync(sql, values);
      return res.status(200).json({ status: 200, msg: 'User data updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  router.post('/changeuserpassword', authenticateJWT, async (req, res) => {
    try {
      const hashedPassword = await hashPassword(req.body.password);
      const result = await queryAsync('UPDATE user SET password = ? WHERE ID = ?', [
        hashedPassword,
        req.body.id,
      ]);

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  router.post('/updateuserstatus', authenticateJWT, async (req, res) => {
    try {
      const nextStatus = req.body.status === 0 ? 1 : 0;
      const result = await queryAsync('UPDATE user SET is_suspended=(?) WHERE id = (?)', [
        nextStatus,
        req.body.id,
      ]);

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  router.post('/updateadminstatus', authenticateJWT, async (req, res) => {
    try {
      const nextStatus = req.body.adminSuspended === 0 ? 1 : 0;
      const result = await queryAsync('UPDATE admin SET Admin_Suspended=(?) WHERE Admin_ID = (?)', [
        nextStatus,
        req.body.adminID,
      ]);

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  return router;
}
