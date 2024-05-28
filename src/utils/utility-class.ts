import { Query, FilterQuery } from "mongoose";
import { Gig } from "../models/GigsModel/gigModel.js";
export class ErrorHandler extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface QueryString {
  [key: string]: string | undefined;
  title?: string;
  description?: string;
  page?: string;
  limit?: string;
}

export class ApiFeatures<T> {
  public query: any;
  private queryStr: any;

  constructor(query: Query<T[], T>, queryStr: any) {
    this.query = query.sort({
      createdAt: -1,
    });
    this.queryStr = queryStr;
  }

  searchByFields(): ApiFeatures<T> {
    const keyword = this.queryStr.keyword
      ? {
          title: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // filter(): ApiFeatures<T> {
  //   const queryCopy = { ...this.queryStr };
  //   const removeFields = ["keyword", "page", "limit"];
  //   removeFields.forEach((key) => delete queryCopy[key]);

  //   // Check if the city field exists
  //   if (this.queryStr.city) {
  //     this.query = this.query.populate({
  //       path: "user",
  //       match: { city: this.queryStr.city }
  //     });
  //   }

  //   // Convert remaining filters to a Mongoose filter query
  //   const filterQuery:any = {};
  //   for (const key in queryCopy) {
  //     if (Object.hasOwnProperty.call(queryCopy, key)) {
  //       filterQuery[key] = queryCopy[key];
  //     }
  //   }

  //   // Apply remaining filters directly to the Mongoose query object
  //   this.query = this.query.find(filterQuery);

  //   return this;
  // }

  filter(): ApiFeatures<T> {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Convert remaining filters to a Mongoose filter query
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    let filterQuery = JSON.parse(queryStr) as FilterQuery<T>;

    // Apply remaining filters directly to the Mongoose query object
    this.query = this.query.find(filterQuery);

    return this;
  }

  pagination(resultPerPage: number): ApiFeatures<T> {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}
