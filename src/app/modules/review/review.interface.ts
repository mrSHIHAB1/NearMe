import { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  service: Types.ObjectId;
  rating?: number;
  comment: string;
  parentReview?: Types.ObjectId | null;
  replies?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}