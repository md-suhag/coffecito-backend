import { IContactUs } from '../app/modules/contactUs/contactUs.interface';
import config from '../config';
import {
  ICreateAccount,
  IResetPassword,
  ISendGiftCard,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
      <body
          style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src=${config.logo_url} alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">
                Hey! ${values.name}${values.name && ','} 
                Your ${config.server_name} Account Credentials
              </h2>
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #277E16; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src=${config.logo_url} alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #277E16; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                  <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:center">
                    If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const contactUs = (values: IContactUs) => {
  const data = {
    to: config.email.supportEmail as string,
    subject: `${values.subject}`,
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src=${config.logo_url} alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Name:${values.name}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Email:${values.email}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Message:</b> ${values.message}</p>
         
        </div>
    </div>
</body>`,
  };
  return data;
};

const sendGiftCard = (values: ISendGiftCard) => {
  const data = {
    to: values.email,
    subject: 'You received a Gift Card!',
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="${config.logo_url}" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px; text-align: center;">
                You received a Gift Card!
              </h2>
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${values.name},</p>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">You have received a gift card of <strong>$${values.amount}</strong>.</p>
  ${values.senderEmail ? `<p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">From: <strong>${values.senderEmail}</strong>.</p>` : ''}
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Card Number:</p>
                  <span style="background-color: #277E16; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto; display: inline-block;">
                      ${values.cardNumber}
                  </span>
                  ${values.message ? `<p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 20px; font-style: italic;">"${values.message}"</p>` : ''}
                  <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;" />
                  <p style="color: #277E16; font-size: 18px; line-height: 1.5; margin-bottom: 20px; font-weight: bold;">
                    You can use this after you sign up to the app. Save this email for your records!
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const emailCampaign = (values: { title: string; description: string }) => {
  const data = {
    html: `
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background-color: #195ABE; padding: 30px; text-align: center;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 120px; filter: brightness(0) invert(1);" />
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                  <h1 style="color: #195ABE; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">
                      ${values.title}
                  </h1>
                  <div style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px;">
                      ${values.description}
                  </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                      &copy; ${new Date().getFullYear()} Coffecito. All rights reserved.
                  </p>
                  <p style="font-size: 12px; color: #999; margin: 5px 0 0;">
                      You are receiving this email because you subscribed to our newsletter.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  contactUs,
  sendGiftCard,
  emailCampaign,
};
