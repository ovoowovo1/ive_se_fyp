import express from 'express';

const sendInvalidCredential = (res) => res.send({ status: 400, msg: 'ID or password is wrong' });

export default function createAuthRouter(context) {
  const router = express.Router();
  const { comparePassword, env, isBcryptHash, jwt, queryAsync, hashPassword } = context;

  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const sql =
        'select * from admin , admin_permission WHERE Admin_ID=(?) and Admin_ID = Admin_Permission_ID';
      const result = await queryAsync(sql, [username]);

      if (!result.length) {
        return sendInvalidCredential(res);
      }

      const admin = result[0];
      const isMatch = await comparePassword(password, admin.Admin_Password);

      if (!isMatch) {
        return sendInvalidCredential(res);
      }

      if (admin.Admin_Suspended === 1) {
        return res.send({ status: 403, msg: 'Your account is suspended' });
      }

      const token = jwt.sign(
        {
          uid: admin.Admin_ID,
          username: admin.Admin_Name,
          Admin_Permission_User: admin.Admin_Permission_User,
          Admin_Permission_Admin: admin.Admin_Permission_Admin,
          Admin_Permission_Analysis: admin.Admin_Permission_Analysis,
          Admin_Permission_Violation: admin.Admin_Permission_Violation,
          Admin_Permission_Donate: admin.Admin_Permission_Donate,
          Admin_Permission_Announcement: admin.Admin_Permission_Announcement,
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn },
      );

      return res.send({
        token,
        status: 200,
        Login_id: admin.Admin_ID,
        username: admin.Admin_Name,
        userimage: admin.Admin_Photo,
        Admin_Permission_User: admin.Admin_Permission_User,
        Admin_Permission_Admin: admin.Admin_Permission_Admin,
        Admin_Permission_Analysis: admin.Admin_Permission_Analysis,
        Admin_Permission_Violation: admin.Admin_Permission_Violation,
        Admin_Permission_Donate: admin.Admin_Permission_Donate,
        Admin_Permission_Announcement: admin.Admin_Permission_Announcement,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  router.post('/Userlogin', async (req, res) => {
    try {
      const { username, password } = req.body;
      const sql = 'select ID,password,is_suspended from user WHERE ID = ?';
      const result = await queryAsync(sql, [username]);

      if (!result.length) {
        return sendInvalidCredential(res);
      }

      const user = result[0];
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return sendInvalidCredential(res);
      }

      if (user.is_suspended === 1) {
        return res.send({ status: 403, msg: 'Your account is suspended' });
      }

      if (!isBcryptHash(user.password)) {
        const upgradedPassword = await hashPassword(password);
        await queryAsync('UPDATE user SET password = ? WHERE ID = ?', [upgradedPassword, username]);
      }

      const token = jwt.sign(
        {
          uid: username,
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn },
      );

      return res.send({ status: 200, msg: 'successful login', token });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  });

  return router;
}
