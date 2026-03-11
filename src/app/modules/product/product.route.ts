import express from 'express';
import { ProductController } from './product.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidations } from './product.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

import authOptional from '../../middlewares/authOptional';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(ProductValidations.createProductValidationSchema),
  ProductController.createProduct,
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ProductController.getAllProducts,
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(ProductValidations.updateProductValidationSchema),
  ProductController.updateProduct,
);

router.delete(
  '/:id/soft',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ProductController.deleteProduct,
);

router.get('/:id', authOptional(), ProductController.getProductById);

export const productRoutes = router;
