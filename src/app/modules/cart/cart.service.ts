import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICart, ICartItem, ISelectedCustomization } from './cart.interface';
import { Cart } from './cart.model';
import { Product } from '../product/product.model';

const getCartFromDB = async (userId: string) => {
  const result = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'readyTime image name',
  );
  return result;
};

const addToCartIntoDB = async (
  userId: string,
  payload: {
    product: string;
    quantity: number;
    selectedCustomizations: {
      customizationId: string;
      optionId?: string;
      optionIds?: string[];
      quantity?: number;
    }[];
  },
) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  // Check for required customizations
  const requiredCustomizations = product.customizations.filter(
    (c: any) => c.isRequired,
  );
  for (const required of requiredCustomizations) {
    const isProvided = payload.selectedCustomizations?.find(
      s => s.customizationId === (required as any)._id.toString(),
    );
    if (!isProvided) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Customization "${required.name}" is required`,
      );
    }
  }

  // Calculate prices from DB
  let unitFinalPrice = product.basePrice;
  const processedCustomizations: ISelectedCustomization[] = [];

  for (const selected of payload.selectedCustomizations || []) {
    const customization = product.customizations.find(
      (c: any) => c._id?.toString() === selected.customizationId,
    );

    if (customization) {
      // Handle array of option IDs (multi-select)
      const optionsToProcess =
        selected.optionIds || (selected.optionId ? [selected.optionId] : []);

      if (optionsToProcess.length > 0 && customization.options) {
        for (const optId of optionsToProcess) {
          const option = customization.options.find(
            (o: any) => o._id?.toString() === optId,
          );
          if (option) {
            processedCustomizations.push({
              customizationId: (customization as any)._id,
              name: customization.name,
              optionId: (option as any)._id,
              optionLabel: option.label,
              optionPrice: option.price,
            });
            unitFinalPrice += option.price;
          }
        }
      }

      // Handle quantity type
      if (selected.quantity && customization.pricePerUnit) {
        const totalPriceForCust =
          selected.quantity * customization.pricePerUnit;
        processedCustomizations.push({
          customizationId: (customization as any)._id,
          name: customization.name,
          quantity: selected.quantity,
          pricePerUnit: customization.pricePerUnit,
          totalPrice: totalPriceForCust,
        });
        unitFinalPrice += totalPriceForCust;
      }
    }
  }

  // Sort processedCustomizations for stable identification (merging logic)
  processedCustomizations.sort((a, b) => {
    const custIdA = a.customizationId.toString();
    const custIdB = b.customizationId.toString();
    if (custIdA !== custIdB) return custIdA.localeCompare(custIdB);

    const optIdA = a.optionId?.toString() || '';
    const optIdB = b.optionId?.toString() || '';
    return optIdA.localeCompare(optIdB);
  });

  const itemTotalPrice = unitFinalPrice * payload.quantity;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
      totalQuantity: 0,
    });
  }

  // Check if item exists (Stable identification)
  const existingItemIndex = cart.items.findIndex(
    item =>
      item.product.toString() === payload.product.toString() &&
      JSON.stringify(item.selectedCustomizations) ===
        JSON.stringify(processedCustomizations),
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += payload.quantity;
    cart.items[existingItemIndex].itemTotalPrice =
      cart.items[existingItemIndex].quantity *
      cart.items[existingItemIndex].unitFinalPrice;
  } else {
    cart.items.push({
      product: product._id as any,
      productName: product.name,
      basePrice: product.basePrice,
      quantity: payload.quantity,
      selectedCustomizations: processedCustomizations,
      unitFinalPrice,
      itemTotalPrice,
    });
  }

  // Recalculate cart totals
  cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.itemTotalPrice,
    0,
  );

  await cart.save();
  return cart;
};

const updateQuantityInDB = async (
  userId: string,
  itemId: string,
  quantity: number,
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => (item as any)._id.toString() === itemId,
  );
  if (itemIndex === -1) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].itemTotalPrice =
      quantity * cart.items[itemIndex].unitFinalPrice;
  }

  // Recalculate cart totals
  cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.itemTotalPrice,
    0,
  );

  await cart.save();
  return cart;
};

const removeItemFromDB = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
  }

  cart.items = cart.items.filter(
    item => (item as any)._id.toString() !== itemId,
  );

  // Recalculate cart totals
  cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.itemTotalPrice,
    0,
  );

  await cart.save();
  return cart;
};

const clearCartFromDB = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalQuantity = 0;
    await cart.save();
  }
  return cart;
};

export const CartServices = {
  getCartFromDB,
  addToCartIntoDB,
  updateQuantityInDB,
  removeItemFromDB,
  clearCartFromDB,
};
