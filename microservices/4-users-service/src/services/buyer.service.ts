import { IBuyerDocument } from '@thejuggernaut01/jobberapp-shared';
import { BuyerModel } from '@users/models/buyer.schema';

const getBuyerByEmail = async (email: string): Promise<IBuyerDocument> => {
  const buyer: IBuyerDocument | null = (await BuyerModel.findOne({ email }).exec()) as IBuyerDocument;
  return buyer;
};

const getBuyerByUsername = async (username: string): Promise<IBuyerDocument> => {
  const buyer: IBuyerDocument | null = (await BuyerModel.findOne({ username }).exec()) as IBuyerDocument;
  return buyer;
};

const getRandomBuyers = async (count: 0): Promise<IBuyerDocument[]> => {
  // $sample operator is used to return random items from the collections
  const buyer: IBuyerDocument[] | null = (await BuyerModel.aggregate([{ $sample: { size: count } }]).exec()) as IBuyerDocument[];

  return buyer;
};

const createBuyer = async (buyerData: IBuyerDocument): Promise<void> => {
  const user: IBuyerDocument | null = await getBuyerByEmail(buyerData.email as string);

  if (!user) {
    await BuyerModel.create(buyerData);
  }
};

const updateBuyerIsSellerProp = async (email: string): Promise<void> => {
  await BuyerModel.updateOne({ email }, { $set: { isSeller: true } }).exec();
};

const updateBuyerPurchasedGigsProp = async (buyerId: string, purchasedGigs: string, type: string): Promise<void> => {
  await BuyerModel.updateOne(
    { _id: buyerId },
    type === 'purchased-gigs'
      ? {
          $push: {
            purchasedGigs: purchasedGigs
          }
        }
      : {
          $pull: {
            purchasedGigs: purchasedGigs
          }
        }
  ).exec();
};

export { getBuyerByEmail, getBuyerByUsername, getRandomBuyers, createBuyer, updateBuyerIsSellerProp, updateBuyerPurchasedGigsProp };
