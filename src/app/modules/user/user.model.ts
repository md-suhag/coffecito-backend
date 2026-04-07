import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { AUTH_PROVIDERS, USER_ROLES, USER_STATUS } from './user.constant';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: 0,
      minlength: 8,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    profileImage: {
      type: String,
      default: '',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    permissions: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
      select: 0,
    },
    appleId: {
      type: String,
      default: null,
      select: 0,
    },
    authProviders: {
      type: [String],
      enum: AUTH_PROVIDERS,
      default: [],
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
    deviceToken: {
      type: String,
      default: null,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
    },
  },
  { timestamps: true },
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true, $type: 'string', $ne: '' },
      isPhoneVerified: true,
    },
  },
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (!ret.phone) {
      ret.phone = ''; // always send empty string to client
    }
    return ret;
  },
});

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  if (this.isModified('password')) {
    if (this.password) {
      this.password = await bcrypt.hash(
        this.password,
        Number(config.bcrypt_salt_rounds),
      );
    }
  }
  next();
});

userSchema.pre(/^find|^count/, function (this: any, next) {
  const filter = this.getFilter();
  if (filter.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } } as any);
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
