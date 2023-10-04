# SAMA Push Notifications service 

## Overview

A web service for Push Notifications.

Currently, only Web pushes are supported.

## Development

- Copy `.env.example` to `.env`
- generate VAPID keys via `npx web-push generate-vapid-keys` and set Public Key to `PUBLIC_VAPID_KEY` and Private Key to `PRIVATE_VAPID_KEY` in `.env` file. The Public Key value should be the same to what is used in **sama-client**
- run `npm install`
- run `npm run start`

## License

[GPL-3.0](LICENSE)
