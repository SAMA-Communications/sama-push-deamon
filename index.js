import PushNotifications from "node-pushnotifications";
import PushSubscription from "./model/push_subscription.js";
import Queue from "bull";
import db from "./lib/db.js";
import decodeBase64 from "./utils/decode_base64.js";
import fs from "fs";

import serviceAccountKey from "./certs/firebase-sama-project-key.json" assert { type: "json" };
import { title } from "process";

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
    serviceAccountKey,
    credential: null,
  },
  apn: {
    token: {
      key: fs.readFileSync("./certs/apns-sama-project-key.json", "utf8"),
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
  const { devices, message } = job.data;
  const registeredDevices = { ios: [], android: [], web: [] };

  for (const device of devices) {
    switch (device.platform) {
      case "ios":
        registeredDevices.ios.push(device.device_token);
        break;
      case "android":
        registeredDevices.android.push(device.device_token);
        break;
      case "web":
      default:
        registeredDevices.web.push({
          endpoint: device.web_endpoint,
          expirationTime: null,
          keys: { p256dh: device.web_key_p256dh, auth: device.web_key_auth },
        });
        break;
    }
  }

  const push = new PushNotifications(settings);

  const closeJob = () => {
    job.progress(100);
    done();
  };

  for (const platform in registeredDevices) {
    if (!registeredDevices[platform].length) continue;

    let decodedMessage = decodeBase64(message);

    switch (platform) {
      case "android":
        decodedMessage = {
          title: decodedMessage.title,
          body: decodedMessage.body,
          custom: { cid: decodedMessage.cid },
        };
        break;
    }

    const pushMessage = decodedMessage || defaultPushMessage;

    try {
      const sentPushes = (
        await push.send(registeredDevices[platform], pushMessage)
      )[0];

      for (let message of sentPushes.message) {
        if (message.error) {
          const pushSubscriptionRecord = await PushSubscription.findOne({
            web_endpoint: message.regId.endpoint,
          });
          if (pushSubscriptionRecord) {
            await pushSubscriptionRecord.delete();
            console.log(
              `[pushNotificationProcess:${platform}] removed failed subscription`,
              message
            );
            closeJob();
          }
        }
      }
      console.log(`[pushNotificationProcess:${platform}] DONE`);
    } catch (error) {
      console.error(`[pushNotificationProcess:${platform}] error`, error);
    }
  }
  closeJob();
};

pushNotificationQueue.process(pushNotificationProcess);
