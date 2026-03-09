import crypto from 'crypto';
import { GiftCard } from '../app/modules/giftCard/giftCard.model';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateGiftCardCode = () => {
  const bytes = crypto.randomBytes(12);

  let code = '';
  for (let i = 0; i < 12; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }

  const grouped = code.match(/.{1,4}/g)?.join('-');

  return `GC-${grouped}`;
};

export const generateUniqueCardNumber = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateGiftCardCode();
    exists = !!(await GiftCard.exists({ cardNumber: code }));
  }

  return code;
};
