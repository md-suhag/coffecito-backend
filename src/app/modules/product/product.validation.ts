import { z } from 'zod';
import { CUSTOMIZATION_TYPE } from './product.constants';

const customizationOptionValidationSchema = z.object({
  label: z.string({ required_error: 'Option label is required' }),
  price: z.number({ required_error: 'Option price is required' }).min(0),
});

const customizationValidationSchema = z.object({
  name: z.string({ required_error: 'Customization name is required' }),
  type: z.nativeEnum(CUSTOMIZATION_TYPE, {
    required_error: 'Customization type is required',
  }),
  isRequired: z.boolean().optional(),
  options: z.array(customizationOptionValidationSchema).optional(),
  pricePerUnit: z.number().min(0).optional(),
});

const createProductValidationSchema = z.object({
  body: z.object({
    store: z.string({ required_error: 'Store ID is required' }),
    name: z.string({ required_error: 'Product name is required' }),
    description: z.string({
      required_error: 'Product description is required',
    }),
    category: z.string({ required_error: 'Category ID is required' }),
    basePrice: z.number({ required_error: 'Base price is required' }).min(0),
    customizations: z.array(customizationValidationSchema).optional(),
    dietaryLabels: z.array(z.string()).optional(),
    readyTime: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ProductValidations = {
  createProductValidationSchema,
};
