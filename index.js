import PushNotifications from "node-pushnotifications";
import Queue from "bull";
import { connectToDB } from "./lib/db.js";

connectToDB(async (err) => {
  if (err) {
    console.error("[connectToDB] Error", err);
    process.exit();
  } else {
    console.log("[connectToDB] Ok");
  }
});

const pushNotificationQueue = new Queue("notification", process.env.REDIS_URL);

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
  const dataObject = message || {
    title: "Title",
    body: "Body",
    message: "payload",
  };

  const push = new PushNotifications(settings);
  push
    .send(regDevices, dataObject)
    .then((result) => {
      result = result[0];

      const devices = [];
      result.message = result.message.filter((device) => {
        devices.push(device.regId);
        if (device.error) {
          device.regId = device.regId.endpoint;
          return true;
        }
        return false;
      });
      result["allDevices"] = devices;

      console.log("[pushNotifications]", result);
    })
    .catch((err) => console.error(`[Error] `, err));

  // job.progress(100);
  done();
};

pushNotificationQueue.process(pushNotificationProcess);
