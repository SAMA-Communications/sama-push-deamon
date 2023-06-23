import { getDb } from "../../lib/db.js";
import { slice } from "../../utils/req_res_utils.js";

export default class BaseModel {
  constructor(params) {
    this.params = params;
    this.hooks = {};
  }

  static get collection() {
    throw new Error("Not implemented");
  }

  static get visibleFields() {
    throw new Error("Not implemented");
  }

  static async findOne(query) {
    try {
      const record = await getDb().collection(this.collection).findOne(query);
      return record ? new this(record) : null;
    } catch (e) {
      return null;
    }
  }

  async delete() {
    await getDb()
      .collection(this.constructor.collection)
      .deleteOne({ _id: this.params._id });
  }

  visibleParams() {
    return slice(this.params, this.constructor.visibleFields);
  }
}
