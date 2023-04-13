import PushNotifications from "node-pushnotifications";

const regIds = [
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/dDGN3r5SXUQ:APA91bFeDHGP9Ewvc2Su18Og7la4PNxiHfHFfNOHmriJMBld4CErC5BioX-fPtuKhVlEkxOi11_0JRskGV3xiIQG94fYlQPMj9gVhCnI1EiB-T7XR3o6fANElQ7E9Ex4pMtH9-2GYfhl",
    expirationTime: null,
    keys: {
      p256dh:
        "BHMUZrHFDscS3VsRB8tZAXFJLYvZlgaQukwAgeHc54JOZe9X-GdHYhepFlh50QH_zlpAfkXDo29avciaRJqzTzs",
      auth: "Ou2Z6b2wRZSejPkSgjykGQ",
    },
  },
];

const dataObject = {
  title: "New push notification",
  topic: "topic",
  body: "Powered by AppFeel",
  message: "payload",
  badge: 4,
};

const settings = {
  web: {
    vapidDetails: {
      subject: "mailto:sender@example.com",
      publicKey:
        "BEDl13AheorvsFF1em9iDmcVVtNe96dzOJac0eZven3TqtreoXvsSfZdPG1xnELHnLVaKXQEzaqReisx9ZKbvsM",
      privateKey: "axplcD-vHtz9fPvxoRtfAaqhQ3WxMbwIYANWyqjiRas",
    },
    gcmAPIKey: "gcmkey",
    TTL: 2419200,
    contentEncoding: "aes128gcm",
    headers: {},
  },
  isAlwaysUseFCM: false,
};

const push = new PushNotifications(settings);

push.send(regIds, dataObject, (err, result) => {
  if (err) {
    console.log(err);
  } else {
    console.log(result);
  }
});
