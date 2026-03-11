import { z } from 'zod';

const addFavoriteZodSchema = z.object({
  body: z.object({
    product: z.string().optional(),
    store: z.string().optional(),
  }),
});
const removeFavoriteZodSchema = z.object({
  body: z.object({
    product: z.string().optional(),
    store: z.string().optional(),
  }),
});

export const FavoriteValidations = {
  addFavoriteZodSchema,
  removeFavoriteZodSchema,
};
