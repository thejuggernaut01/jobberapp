import { IBuyerDocument } from '@thejuggernaut01/jobberapp-shared';
import mongoose, { Model, Schema } from 'mongoose';

const buyerSchema: Schema = new Schema({
  username: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  profilePicture: { type: String, required: true },
  country: { type: String, required: true },
  isSeller: { type: Boolean, required: true },
  purchasedGigs: [{ type: Schema.Types.ObjectId, ref: 'Gig' }],
  createdAt: { type: Date }
});

export const BuyerModel: Model<IBuyerDocument> = mongoose.model<IBuyerDocument>('Buyer', buyerSchema);
