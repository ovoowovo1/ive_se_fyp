import express from 'express';

export default function createRealtimeRouter(context) {
  const router = express.Router();
  const { db, uuidv4 } = context;
  const clients = {};
  const userClients = {};

  const closeSseConnection = (clientId) => {
    if (!clients[clientId]) {
      return;
    }

    clients[clientId].res.status(204).end();
    delete clients[clientId];
  };

  router.get('/events', (req, res) => {
    const userId = req.query.userId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const clientId = uuidv4();

    clients[clientId] = { res, userId };
    userClients[userId] = userClients[userId] || [];
    userClients[userId].push(clientId);

    res.write(`data: ${JSON.stringify({ message: 'Initial data' })} \n\n`);

    req.on('close', () => {
      delete clients[clientId];

      db.query('UPDATE admin SET Admin_Last_Logout = NOW() WHERE Admin_ID = ?', [userId], (error) => {
        if (error) {
          console.error(error);
        }
      });

      const clientIndex = userClients[userId] ? userClients[userId].indexOf(clientId) : -1;
      if (clientIndex > -1) {
        userClients[userId].splice(clientIndex, 1);
      }
      if (userClients[userId] && userClients[userId].length === 0) {
        delete userClients[userId];
      }
    });
  });

  router.get('/logout/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query('UPDATE admin SET Admin_Last_Logout = NOW() WHERE Admin_ID = ?', [userId], (error) => {
      if (error) {
        console.error(error);
      }
    });

    if (userClients[userId]) {
      userClients[userId].forEach((clientId) => {
        closeSseConnection(clientId);
      });
      delete userClients[userId];
    }

    res.send('SSE connection and database update successful.');
  });

  router.get('/onlineUsers', (_req, res) => {
    res.json(Object.keys(userClients));
  });

  return router;
}
