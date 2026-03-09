export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type ISendGiftCard = {
  email: string;
  name: string;
  amount: number;
  cardNumber: string;
  message?: string;
  senderEmail?: string;
};
