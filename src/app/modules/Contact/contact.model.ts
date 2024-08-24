import { Schema, model } from 'mongoose';
import { IContact } from './contact.interface';

const contactSchema = new Schema<IContact>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// Create the Contact model using the schema
export const Contact = model<IContact>('Contact', contactSchema);
