// import { Types } from "mongoose";

// export enum CategoryStatus {
//   PENDING = "PENDING",
//   APPROVED = "APPROVED",
//   REJECTED = "REJECTED",
// }

// export interface ICategory {
//   _id?: Types.ObjectId;
//   name: string;
//   createdBy?: Types.ObjectId;
//   status: CategoryStatus;
// }

import { Types } from "mongoose";

export interface ICategory {
  _id?: Types.ObjectId;
  name: string;
  image?: string;
  parent?: Types.ObjectId | null;
  level: 0 | 1 | 2;
  isCustom?: boolean;
  isApproved?: boolean;
}