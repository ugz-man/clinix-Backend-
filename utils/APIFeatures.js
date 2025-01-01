module.exports = class {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    //  make a copy of the query object
    const queryObject = { ...this.queryObject };
    // remove this special fields from the qury object
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((field) => delete queryObject[field]);

    // advanced filtering
    let queryString = JSON.stringify(queryObject);
    // replace all the special mogodb comparison characters i.e lt, lte gt gte with the correct one
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    queryString = JSON.parse(queryString);
    this.query = this.query.find(queryString);
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortBy = this.queryObject.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.quey = this.query.sort("-ratingsAverage");
    }
    return this;
  }

  limitFields() {
    if (this.queryObject.fields) {
      const fields = this.queryObject.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select(
        "profilePicture name specialization ratingsAverage yearsOfExperience about"
      );
    }
    return this;
  }

  paginate() {
    const page = this.queryObject.page * 1 || 1;
    const limit = this.queryObject.limit * 1 || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
