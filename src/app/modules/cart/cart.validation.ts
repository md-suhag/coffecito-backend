import { z } from 'zod';

const selectedCustomizationValidationSchema = z.object({
  customizationId: z.string({
    required_error: 'Customization ID is required',
  }),
  optionId: z.string().optional(),
  optionIds: z.array(z.string()).optional(),
  quantity: z.number().optional(),
});

const addToCartValidationSchema = z.object({
  body: z.object({
    product: z.string({
      required_error: 'Product ID is required',
    }),
    quantity: z.number().min(1).default(1),
    selectedCustomizations: z
      .array(selectedCustomizationValidationSchema)
      .optional()
      .default([]),
  }),
});

const updateQuantityValidationSchema = z.object({
  body: z.object({
    itemId: z.string({
      required_error: 'Item ID is required',
    }),
    quantity: z.number().min(0, 'Quantity must be 0 or more'),
  }),
});

const updateCartAddonsValidationSchema = z.object({
  body: z.object({
    tipAmount: z.number().min(0).optional(),
    redeemLoyaltyPoints: z.number().min(0).optional(),
  }),
});

export const CartValidations = {
  addToCartValidationSchema,
  updateQuantityValidationSchema,
  updateCartAddonsValidationSchema,
};
