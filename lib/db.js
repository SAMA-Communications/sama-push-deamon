import { MongoClient, ObjectId as OID } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URL);

let dbConnection;

export function connectToDB(callback) {
  client.connect(function (err, db) {
    if (err || !db) {
      return callback(err);
    }

    const mongoURISplit = process.env.MONGODB_URL.split("/");
    const dbName = mongoURISplit[mongoURISplit.length - 1].split("?")[0];

    dbConnection = db.db(dbName);

    return callback();
  });
}

export function getDb() {
  return dbConnection;
}

export function getClient() {
  return client;
}

export const ObjectId = OID;