import PushNotifications from "node-pushnotifications";
import PushSubscription from "./model/push_subscription.js";
import Queue from "bull";
import db from "./lib/db.js";
import decodeBase64 from "./utils/decode_base64.js";
import fs from "fs";

db.connectToDB(async (err) => {
  if (err) {
    console.error("[connectToDB] Error", err);
    process.exit();
  } else {
    console.log("[connectToDB] Ok");
  }
});

const pushNotificationQueue = new Queue(
  process.env.SAMA_PUSH_QUEUE_NAME,
  process.env.REDIS_URL
);

const settings = {
  fcm: {
    appName: process.env.FCM_APP_NAME,
    serviceAccountKey: fs.readFileSync(
      "./certs/firebase-sama-project-key.json"
    ),
    credential: null,
  },
  apn: {
    token: {
      key: fs.readFileSync("./certs/apns-sama-project-key.json"),
      keyId: process.env.APN_KEY_ID,
      teamId: process.env.APN_TEAM_ID,
    },
    production: process.env.APN_IS_PRODUCTION,
  },
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

const defaultPushMessage = { title: "Title", body: "Body", message: "payload" };

const pushNotificationProcess = async (job, done) => {
  const { devices, message, platform } = job.data;
  const registeredDevices = [];

  console.log(message, platform);

  for (const device of devices) {
    console.log(device, platform);
    switch (platform) {
      case "ios":
        registeredDevices.push(device.device_token);
        break;
      case "android":
        registeredDevices.push(device.device_token);
        break;
      case "web":
      default:
        registeredDevices.push({
          endpoint: device.web_endpoint,
          expirationTime: null,
          keys: { p256dh: device.web_key_p256dh, auth: device.web_key_auth },
        });
        break;
    }
  }

  //TODO: reed fields for notification from queue, also add list of allowed fileds for message
  const decodedMessage = decodeBase64(message);
  const pushMessage = decodedMessage || defaultPushMessage;

  const push = new PushNotifications(settings);

  const closeJob = () => {
    job.progress(100);
    done();
  };

  try {
    const sentPushes = (await push.send(registeredDevices, pushMessage))[0];

    for (let message of sentPushes.message) {
      if (message.error) {
        const pushSubscriptionRecord = await PushSubscription.findOne({
          web_endpoint: message.regId.endpoint,
        });
        if (pushSubscriptionRecord) {
          await pushSubscriptionRecord.delete();
          console.log(
            "[pushNotificationProcess] removed failed subscription",
            message
          );
          closeJob();
        }
      }
    }
    console.log("[pushNotificationProcess] DONE");
  } catch (error) {
    console.error(`[pushNotificationProcess] error`, error);
  }
  closeJob();
};

pushNotificationQueue.process(pushNotificationProcess);
