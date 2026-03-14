import { z } from 'zod';
import { CUSTOMIZATION_OPTION_TYPE } from './customizationOption.constants';

const createCustomizationOptionValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    price: z.number({ required_error: 'Price is required' }),
    type: z.nativeEnum(CUSTOMIZATION_OPTION_TYPE, {
      required_error: 'Type is required',
    }),
    status: z.boolean().optional(),
  }),
});

const updateCustomizationOptionValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    type: z.nativeEnum(CUSTOMIZATION_OPTION_TYPE).optional(),
    status: z.boolean().optional(),
  }),
});

export const CustomizationOptionValidations = {
  createCustomizationOptionValidationSchema,
  updateCustomizationOptionValidationSchema,
};
