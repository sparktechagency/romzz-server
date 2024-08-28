import { ObjectId } from 'mongoose';

export interface IFavourite {
  userId: ObjectId; // Reference to the User
  propertyId: ObjectId; // Reference to the Property
}
