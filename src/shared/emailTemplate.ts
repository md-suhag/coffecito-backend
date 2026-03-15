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
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 120px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #195ABE; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">
                    Hello ${values.name || 'User'}!
                  </h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    Thank you for joining coffecito. To complete your account verification, please use the following one-time password:
                  </p>
                  
                  <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; display: inline-block; min-width: 200px; margin-bottom: 25px;">
                      <span style="color: #195ABE; font-size: 32px; font-weight: 700; letter-spacing: 5px; display: block;">
                          ${values.otp}
                      </span>
                  </div>
                  
                  <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                    This code is valid for <strong>3 minutes</strong>.
                  </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                      &copy; ${new Date().getFullYear()} Coffecito. All rights reserved.
                  </p>
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
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 120px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #195ABE; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">
                    Password Reset Request
                  </h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    We received a request to reset your password. Use the code below to proceed:
                  </p>
                  
                  <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; display: inline-block; min-width: 200px; margin-bottom: 25px;">
                      <span style="color: #195ABE; font-size: 32px; font-weight: 700; letter-spacing: 5px; display: block;">
                          ${values.otp}
                      </span>
                  </div>
                  
                  <p style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                    This code is valid for <strong>3 minutes</strong>.
                  </p>

                  <div style="background-color: #fff4f4; border-left: 4px solid #dc3545; padding: 15px; text-align: left; border-radius: 4px;">
                      <p style="color: #666; font-size: 13px; line-height: 1.4; margin: 0;">
                        <strong>Security Note:</strong> If you didn't request this code, you can safely ignore this email. Someone else might have entered your email by mistake.
                      </p>
                  </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                      &copy; ${new Date().getFullYear()} Coffecito. All rights reserved.
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
    subject: `Support Request: ${values.subject}`,
    html: `
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 120px;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                  <h2 style="color: #195ABE; font-size: 20px; margin-top: 0; margin-bottom: 25px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">
                    New Support Inquiry
                  </h2>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 10px 0; color: #888; font-size: 14px; width: 100px;">Name</td>
                          <td style="padding: 10px 0; color: #333; font-size: 15px; font-weight: 500;">${values.name}</td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0; color: #888; font-size: 14px;">Email</td>
                          <td style="padding: 10px 0; color: #333; font-size: 15px; font-weight: 500;">${values.email}</td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0; color: #888; font-size: 14px;">Subject</td>
                          <td style="padding: 10px 0; color: #333; font-size: 15px; font-weight: 500;">${values.subject}</td>
                      </tr>
                  </table>
                  
                  <div style="margin-top: 25px; background-color: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #efefef;">
                      <p style="color: #888; font-size: 13px; text-transform: uppercase; margin-top:0; margin-bottom: 10px; font-weight: 700;">Message</p>
                      <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">${values.message}</p>
                  </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                      Support Notification for Coffecito
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const sendGiftCard = (values: ISendGiftCard) => {
  const data = {
    to: values.email,
    subject: 'Surprise! You received a Gift Card!',
    html: `
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333;">
          <div style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 140px; margin-bottom: 20px;" />
                  <h1 style="color: #195ABE; font-size: 28px; font-weight: 700; margin: 0;">A Gift Just For You!</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #195ABE; font-size: 22px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">
                    Hello ${values.name},
                  </h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                    Great news! You've received a gift card evaluation of:
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #195ABE 0%, #1e70e0 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; color: #fff; box-shadow: 0 10px 20px rgba(25, 90, 190, 0.2);">
                      <p style="font-size: 14px; margin: 0 0 10px; opacity: 0.8; text-transform: uppercase; font-weight: 700;">Value</p>
                      <h2 style="font-size: 48px; margin: 0; color: #fff; font-weight: 800;">$${values.amount}</h2>
                      <p style="margin: 20px 0 5px; font-size: 12px; opacity: 0.8;">CARD NUMBER</p>
                      <p style="font-size: 22px; font-weight: 700; letter-spacing: 2px; margin: 0;">${values.cardNumber}</p>
                  </div>
                  
                  ${values.senderEmail ? `<p style="color: #777; font-size: 14px; margin-bottom: 20px;">Sent with love from: <strong>${values.senderEmail}</strong></p>` : ''}
                  
                  ${
                    values.message
                      ? `
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; font-style: italic; color: #555; margin-bottom: 30px; border-left: 4px solid #195ABE;">
                    "${values.message}"
                  </div>
                  `
                      : ''
                  }
                  
                  <p style="color: #444; font-size: 16px; font-weight: 600; line-height: 1.5; margin-bottom: 10px;">
                    How to redeem?
                  </p>
                  <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                    Simply download the app, sign in, and enter your card number in the Gift Cards section to add the balance to your account.
                  </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999; margin: 0;">
                      &copy; ${new Date().getFullYear()} Coffecito. All rights reserved.
                  </p>
                  <p style="font-size: 11px; color: #ccc; margin-top: 10px;">
                    Save this email for your records.
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
              <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="${config.logo_url}" alt="Logo" style="width: 120px;" />
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
