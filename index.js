import PushNotifications from "node-pushnotifications";
import Queue from "bull";

const pushNotificationQueue = new Queue("notification", process.env.REDIS_URL, {
  redis: { maxRetriesPerRequest: null, enableReadyCheck: false },
});

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

const pushNotificationProcess = async (job, done) => {
  const { devices, message } = job.data;

  const regDevices = [];
  for (const userId in devices) {
    const uDevices = devices[userId];
    uDevices.forEach((el) => {
      regDevices.push({
        endpoint: el.web_endpoint,
        expirationTime: null,
        keys: { p256dh: el.web_key_p256dh, auth: el.web_key_auth },
      });
    });
  }

  //TODO: reed fields for notification from queue, also add list of allowed fileds for message
  const dataObject = {
    title: message.title || "Title",
    body: message.body || "Body",
    message: "payload",
  };

  const push = new PushNotifications(settings);
  push.send(regDevices, dataObject, (err, result) =>
    console.log(err ? err : result)
  );

  done();
};

pushNotificationQueue.process(pushNotificationProcess);
