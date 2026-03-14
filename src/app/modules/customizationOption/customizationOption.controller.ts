import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CustomizationOptionServices } from './customizationOption.service';

const createCustomizationOption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomizationOptionServices.createCustomizationOptionIntoDB(
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Customization option created successfully',
      data: result,
    });
  },
);

const getAllCustomizationOptions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomizationOptionServices.getAllCustomizationOptionsFromDB(
      req.query,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Customization options fetched successfully',
      data: result.result,
      pagination: result.meta,
    });
  },
);

const getSingleCustomizationOption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomizationOptionServices.getSingleCustomizationOptionFromDB(
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Customization option fetched successfully',
      data: result,
    });
  },
);

const updateCustomizationOption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomizationOptionServices.updateCustomizationOptionIntoDB(
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Customization option updated successfully',
      data: result,
    });
  },
);

const deleteCustomizationOption = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomizationOptionServices.deleteCustomizationOptionFromDB(
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Customization option deleted successfully',
      data: result,
    });
  },
);

export const CustomizationOptionController = {
  createCustomizationOption,
  getAllCustomizationOptions,
  getSingleCustomizationOption,
  updateCustomizationOption,
  deleteCustomizationOption,
};
