# SAMA Push Notifications service 

## Overview

A web service for Push Notifications.

Currently, only Web pushes are supported.

## Development

- Copy `.env.example` to `.env`
- generate VAPID keys via `npx web-push generate-vapid-keys` and set Public Key to `PUBLIC_VAPID_KEY` and Private Key to `PRIVATE_VAPID_KEY` in `.env` file. The Public Key value should be the same to what is used in **sama-client**
- run `npm install`
- run `npm run start`

There are also other components. Make sure to check [Deploying SAMA chat server stack: a comprehensive guide](https://medium.com/sama-communications/deploying-sama-chat-server-stack-a-comprehensive-guide-294ddb9a2d78)

## License

[GPL-3.0](LICENSE)

## Help us!

Any thoughts, feedback is welcome! Please create a GitHub issue for any feedback you have.

Want to support us with [some coffee?](https://www.buymeacoffee.com/khomenkoigor). Will be much appreciated! 

