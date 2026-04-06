import { z } from 'zod';
import { CUSTOMIZATION_OPTION_TYPE } from './customizationOption.constants';

const createCustomizationOptionValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    type: z.nativeEnum(CUSTOMIZATION_OPTION_TYPE, {
      required_error: 'Type is required',
    }),
    isRequired: z.boolean().optional(),
    status: z.boolean().optional(),
  }),
});

const updateCustomizationOptionValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.nativeEnum(CUSTOMIZATION_OPTION_TYPE).optional(),
    isRequired: z.boolean().optional(),
    status: z.boolean().optional(),
  }),
});

const addOptionValidationSchema = z.object({
  body: z.object({
    label: z.string({ required_error: 'Label is required' }),
    price: z.number({ required_error: 'Price is required' }).min(0),
  }),
});

const updateOptionValidationSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    price: z.number().min(0).optional(),
  }),
});

export const CustomizationOptionValidations = {
  createCustomizationOptionValidationSchema,
  updateCustomizationOptionValidationSchema,
  addOptionValidationSchema,
  updateOptionValidationSchema,
};
