import { Types } from "mongoose";

export interface IHighlightService {
  _id?: Types.ObjectId;

  service: Types.ObjectId;

  title: string;

  image: string;

  description: string;

  createdAt?: Date;
  updatedAt?: Date;
}