export default function decodeBase64(string_message) {
  return JSON.parse(Buffer.from(string_message, "base64").toString("utf8"));
}
