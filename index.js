import PushNotifications from "node-pushnotifications";
import PushSubscription from "./model/push_subscription.js";
import db from "./lib/db.js";
import decodeBase64 from "./utils/decode_base64.js";
import fs from "fs";
import { Worker } from "bullmq";

import serviceAccountKey from "./certs/firebase-sama-project-key.json" with { type: "json" };

db.connectToDB(async (err) => {
  if (err) {
    console.error("[connectToDB] Error", err);
    process.exit();
  } else {
    console.log("[connectToDB] Ok");
  }
});


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
    production: process.env.APN_IS_PRODUCTION === "true" ? true : false,
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

const pushNotificationProcess = async (job) => {
  const { devices = [], message } = job.data;
  const registeredDevices = { ios: [], android: [], web: [] };

  if (!devices?.length) return;

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

  for (const platform in registeredDevices) {
    if (!registeredDevices[platform].length) continue;

    let decodedMessage = decodeBase64(message);
    decodedMessage.is_encrypted && (decodedMessage.body = "New message");

    switch (platform) {
      case "android":
        decodedMessage = { custom: { ...decodedMessage } };
        break;
      case "ios":
        decodedMessage = {
          title: decodedMessage.title,
          body: decodedMessage.body,
          mutableContent: 1,
          custom: {
            ...decodedMessage,
            payload: JSON.stringify(decodedMessage),
          },
        };
        break;
    }

    const pushMessage = decodedMessage || defaultPushMessage;
    if (platform === "ios") pushMessage.topic = process.env.APN_TOPIC;


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
          }
        }
      }
      console.log(`[pushNotificationProcess:${platform}] DONE`);
    } catch (error) {
      console.error(`[pushNotificationProcess:${platform}] error`, error);
    }
  }
};

const worker = new Worker(process.env.SAMA_PUSH_QUEUE_NAME, pushNotificationProcess, {
  connection: { url: process.env.REDIS_URL },
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed`, err);
});
