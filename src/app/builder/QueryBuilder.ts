import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>; // The Mongoose query object
  public query: Record<string, unknown>; // Object containing query parameters

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

    const excludeFields = [
      'searchTerm',
      'price',
      'sort',
      'fields',
      'limit',
      'page',
    ];

    excludeFields.forEach((el) => delete queryObj[el]);

    // Update to handle filtering with multiple values for a parameter
    for (const key in queryObj) {
      const value = queryObj[key];
      // Check if the value is a string containing comma-separated values
      if (typeof value === 'string' && value.includes(',')) {
        // Split the string into an array of individual values
        queryObj[key] = { $in: value.split(',') };
      }
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  // Method for range filtering, e.g., price, age, etc.
  rangeFilter() {
    const priceRange = this.query['price'] as string;

    // Check if priceRange exists and contains a hyphen for range
    if (priceRange && priceRange?.includes('-')) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = Number(minStr); // Default min to 0 if not provided
      const max = Number(maxStr);

      // Apply the filter for the price range
      this.modelQuery = this.modelQuery.find({
        price: { $gte: min, $lte: max },
      });
    }

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
