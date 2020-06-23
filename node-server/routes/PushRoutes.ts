import { Router } from "express";

import { Database } from "../database/Database";
import { WebpushUtils } from "../utils/WebpushUtils";

export default (db: Database) => {
  const router = Router();
  
  router.get('/publickey', (req, res) => {
    res.send( WebpushUtils.getPublicKey() );
  });
  router.get('/test/:subscriptionId', async (req, res) => {
    const sub = await db.findSubscriptionById(req.params.subscriptionId);
    WebpushUtils.getWebpush().sendNotification(
      JSON.parse(sub.jsonData),
      JSON.stringify({
        title: 'Test',
        body: 'this is a test',
        icon: '/notification-icon.png'
      })
    );
    res.send( { status: 'ok' } );
  });
  router.delete('/:subscriptionId', async (req, res) => {
    await db.removeSubscription('', {id: req.params.subscriptionId});
    res.send( { status: 'ok' } );
  });
  router.post('/userprofile/:profileId/subscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.saveOrUpdateSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });
  router.post('/userprofile/:profileId/unsubscribe', async function(req, res) {
    let subscription = req.body;
    subscription = await db.removeSubscription(req.params.profileId, subscription);
    res.send(subscription);
  });

  return router;
}
