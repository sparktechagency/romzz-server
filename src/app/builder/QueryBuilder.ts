import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>; // The Mongoose query object
  public query: Record<string, unknown>; // Object containing query parameters

  // Method to handle comma-separated values
  private handleCommaSeparatedValues(
    key: string,
    value: string,
    queryObj: Record<string, unknown>,
  ) {
    queryObj[key] = { $in: value.split(',') };
  }

  // Method to handle nested fields using dot notation
  private handleNestedFields(
    key: string,
    value: string,
    queryObj: Record<string, unknown>,
  ) {
    if (value.includes(',')) {
      this.handleCommaSeparatedValues(key, value, queryObj);
    } else if (value.includes('-')) {
      this.handleRange(key, value, queryObj);
    }
  }

  // Method to handle hyphen-separated ranges
  private handleRange(
    key: string,
    value: string,
    queryObj: Record<string, unknown>,
  ) {
    const [min, max] = value.split('-').map((val) => parseFloat(val));
    if (!isNaN(min) && !isNaN(max)) {
      queryObj[key] = { $gte: min, $lte: max };
    }
  }

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // Method to perform a search based on given searchable fields, including populated fields
  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;

    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  // Method to apply filters based on query parameters
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'fields', 'limit', 'page'];

    // Remove excluded fields
    excludeFields.forEach((el) => delete queryObj[el]);

    // Process query parameters
    for (const key in queryObj) {
      const value = queryObj[key];

      if (typeof value === 'string') {
        if (key.includes('.')) {
          // Handle nested fields (dot notation)
          this.handleNestedFields(key, value, queryObj);
        } else if (value.includes(',')) {
          // Handle comma-separated values for top-level fields
          this.handleCommaSeparatedValues(key, value, queryObj);
        } else if (value.includes('-')) {
          // Handle hyphen-separated ranges for top-level fields
          this.handleRange(key, value, queryObj);
        }
      }
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  // Method to apply sorting based on query parameter
  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  // Method to select specific fields to include/exclude from the result
  fields() {
    const fields = (this?.query?.fields as string)?.split(',')?.join(' ');

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  // Method to paginate results based on query parameters
  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
