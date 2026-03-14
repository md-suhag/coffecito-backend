import crypto from 'crypto';
import { Order } from '../app/modules/order/order.model';
import { WalletTransaction } from '../app/modules/walletTransaction/walletTransaction.model';
import { GiftCardTransaction } from '../app/modules/giftCardTransaction/giftCardTransaction.model';
import { PointTransaction } from '../app/modules/pointTransaction/pointTransaction.model';

export const generateSecureId = async (
  prefix: string,
  model: any,
  fieldName: string,
): Promise<string> => {
  let isUnique = false;
  let finalId = '';

  while (!isUnique) {
    const randomString = crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase(); // 10 characters
    finalId = `${prefix}${randomString}`;

    // Local uniqueness check
    const isExist = await model.findOne({ [fieldName]: finalId }).lean();

    if (!isExist) {
      isUnique = true;
    }
  }

  return finalId;
};
