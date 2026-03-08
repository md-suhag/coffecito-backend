import { Schema, model } from 'mongoose';
import { IContactUs } from './contactUs.interface';

const contactUsSchema = new Schema<IContactUs>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const ContactUs = model<IContactUs>('ContactUs', contactUsSchema);
