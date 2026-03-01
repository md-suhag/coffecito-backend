import { Schema, model } from 'mongoose';
import { IAdmin, AdminModel } from './admin.interface';

const adminSchema = new Schema<IAdmin, AdminModel>({
  // Define schema fields here
});

export const Admin = model<IAdmin, AdminModel>(
  'Admin',
  adminSchema
);