import express from 'express';
import { ProductController } from './product.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidations } from './product.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(ProductValidations.createProductValidationSchema),
  ProductController.createProduct,
);

export const productRoutes = router;
