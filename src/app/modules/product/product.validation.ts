import { z } from 'zod';
import { CUSTOMIZATION_TYPE } from './product.constants';

const createProductValidationSchema = z.object({
  body: z.object({
    store: z.string({ required_error: 'Store ID is required' }),
    name: z.string({ required_error: 'Product name is required' }),
    description: z.string({
      required_error: 'Product description is required',
    }),
    category: z.string({ required_error: 'Category ID is required' }),
    basePrice: z.number({ required_error: 'Base price is required' }).min(0),
    customizations: z.array(z.string()).optional(),
    dietaryLabels: z.array(z.string()).optional(),
    readyTime: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    store: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    customizations: z.array(z.string()).optional(),
    dietaryLabels: z.array(z.string()).optional(),
    readyTime: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ProductValidations = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
