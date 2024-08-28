import { model, Schema } from 'mongoose';
import { IFavourite } from './favourite.interface';

// Define the Favourite schema
const FavouriteSchema: Schema = new Schema<IFavourite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Create the Favourite model
export const Favourite = model<IFavourite>('Favourite', FavouriteSchema);
