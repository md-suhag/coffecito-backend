import { Model } from 'mongoose';

export interface IContactUs {
  name: string;
  email: string;
  subject: string;
  message: string;
}
