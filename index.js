import PushNotifications from "node-pushnotifications";
import Queue from "bull";

const pushNotificationQueue = new Queue("notification", {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOSTNAME,
  },
});

//TODO: move to new file
const pushNotificationProcess = async (job, done) => {
  const { endpoint, key_p256dh: p256dh, key_auth: auth } = job.data;

  const dataObject = {
    title: "Notification",
    topic: "topic",
    body: "Message from sama-push-deamon",
    message: "payload",
    badge: 4,
  };

  const settings = {
    web: {
      vapidDetails: {
        subject: process.env.SUBJECT,
        publicKey: process.env.PUBLIC_VAPID_KEY,
        privateKey: process.env.PRIVATE_VAPID_KEY,
      },
      gcmAPIKey: "gcmkey",
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
  };

  const push = new PushNotifications(settings);
  push.send(
    [
      {
        endpoint,
        expirationTime: null,
        keys: { p256dh, auth },
      },
    ],
    dataObject,
    (err, result) => console.log(err ? err : result)
  );

  done();
};

pushNotificationQueue.process(pushNotificationProcess);
