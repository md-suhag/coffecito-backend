import { Model } from 'mongoose';

export interface ICategory {
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryModel = Model<ICategory>;
