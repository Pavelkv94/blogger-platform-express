import { NextFunction, Request, Response } from "express";
import { AdditionalQueryInputModel } from "../auth/models/auth.models";
import { securityDevicesQueryRepository } from "./securityDevices.query-repository";
import { ApiError } from "../../exeptions/api-error";
import { DeviceViewModel, URIParamsDeviceModel } from "./models/securityDevices.model";
import { HTTP_STATUSES, ResultStatus } from "../../types/common-types";
import { securityDevicesService } from "./securityDevices.service";

export const securityDevicesController = {
  async getSecurityDevices(req: Request<{}, {}, {}, AdditionalQueryInputModel>, res: Response<DeviceViewModel[]>, next: NextFunction) {
    try {
      const devices = await securityDevicesQueryRepository.getSecurityDevices(req.user.id);

      res.status(HTTP_STATUSES.SUCCESS).json(devices);
    } catch (error) {
      return next(ApiError.UnexpectedError(error as Error));
    }
  },
  async deleteOtherDevices(req: Request<{}, {}, {}, AdditionalQueryInputModel>, res: Response, next: NextFunction) {
    try {
      const isDeleted = await securityDevicesService.deleteOtherSecurityDevices(req.user.id, req.user.deviceId);

      if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT);
        return;
      } else {
        return next(ApiError.NotFound("The requested resource was not found"));
      }
    } catch (error) {
      return next(ApiError.UnexpectedError(error as Error));
    }
  },
  async deleteDevice(req: Request<URIParamsDeviceModel, {}, {}, AdditionalQueryInputModel>, res: Response, next: NextFunction) {
    try {
      const { status, errorMessage, data: isDeleted } = await securityDevicesService.deleteSecurityDevice(req.params.id, req.user.id);

      if (status === ResultStatus.SUCCESS && isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT);
      } else if (status === ResultStatus.FORBIDDEN) {
        return next(ApiError.Forbidden(errorMessage));
      } else {
        return next(ApiError.NotFound("The requested resource was not found"));
      }
    } catch (error) {
      return next(ApiError.UnexpectedError(error as Error));
    }
  },
};