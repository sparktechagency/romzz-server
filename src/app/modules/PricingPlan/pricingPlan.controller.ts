import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { PricingPlanService } from "./pricingPlan.service";

const createPackage = catchAsync(async(req: Request, res: Response)=>{
    const result = await PricingPlanService.createPackageToDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Package created Successfully",
        data: result
    })
})

const updatePackage = catchAsync(async(req: Request, res: Response)=>{
    const result = await PricingPlanService.updatePackageToDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Package updated Successfully",
        data: result
    })
})

const getPackage = catchAsync(async(req: Request, res: Response)=>{
    const result = await PricingPlanService.getPackageFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Package Retrieved Successfully",
        data: result
    })
})

const packageDetails = catchAsync(async(req: Request, res: Response)=>{
    const result = await PricingPlanService.getPackageDetailsFromDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Package Details Retrieved Successfully",
        data: result
    })
})


const deletePackage = catchAsync(async(req: Request, res: Response)=>{
    const result = await PricingPlanService.deletePackageToDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Package Deleted Successfully",
        data: result
    })
})

export const PricingPlanController = {
    createPackage,
    updatePackage,
    getPackage,
    packageDetails,
    deletePackage
}