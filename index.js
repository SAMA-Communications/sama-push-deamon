import PushNotifications from "node-pushnotifications";

const regIds = [
  //TODO: upload this from sama-server
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/dDGN3r5SXUQ:APA91bFeDHGP9Ewvc2Su18Og7la4PNxiHfHFfNOHmriJMBld4CErC5BioX-fPtuKhVlEkxOi11_0JRskGV3xiIQG94fYlQPMj9gVhCnI1EiB-T7XR3o6fANElQ7E9Ex4pMtH9-2GYfhl",
    expirationTime: null,
    keys: {
      p256dh:
        "BPWgDabsdYv4GF7fxadB7s/QjQoWfk3h//nVbrIauxPVG51f4QeJeL0M4B2IHENOTF6wTn92PLC6IUs0JPCDI78=",
      auth: "126LJgDuBIzPKloLWUY3Og==",
    },
  },
];

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

push.send(regIds, dataObject, (err, result) => console.log(err ? err : result));
