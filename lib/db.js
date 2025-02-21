import { MongoClient } from "mongodb";

class DataBase {
  client;
  dbConnection;

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URL);
  }

  connectToDB(callback) {
    this.client.connect((err, db) => {
      if (err || !db) {
        return callback(err);
      }

      const mongoURISplit = process.env.MONGODB_URL.split("/");
      const dbName = mongoURISplit.at(-1).split("?")[0];

      this.dbConnection = db.db(dbName) || {};

      return callback();
    });
  }

  getDb() {
    return this.dbConnection;
  }

  getClient() {
    return this.client;
  }
}

const db = new DataBase();

export default db;
