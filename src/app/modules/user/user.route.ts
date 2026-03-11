import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from './user.constant';
const router = express.Router();

// create user
router.post(
  '/',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser,
);

// update profile
router.patch(
  '/profile',
  auth(),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateProfile,
);

// get profile
router.get('/profile', auth(), UserController.getUserProfile);

router.get(
  '/loyalty-points',
  auth(USER_ROLES.CUSTOMER),
  UserController.getMyLoyaltyPoints,
);

router.delete(
  '/:id',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(UserValidation.deleteMyAccountZodSchema),
  UserController.deleteMyAccount,
);

export const UserRoutes = router;
