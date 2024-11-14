import { jwtService } from "../../adapters/jwt/jwt.service";
import { JWTPayloadModel } from "../../adapters/jwt/models/jwt.models";
import { ResultObject, ResultStatus } from "../../types/common-types";
import { securityDevicesRepository } from "./securityDevices.repository";

export const securityDevicesService = {
  async addDevice(refreshToken: JWTPayloadModel, ip: string, userAgent: string): Promise<string> {
    const newDevice = {
      deviceId: refreshToken.deviceId,
      user_id: refreshToken.user_id,
      lastActiveDate: new Date(refreshToken.iat * 1000).toISOString(),
      expirationDate: refreshToken.exp,
      title: userAgent,
      ip: ip,
    };

    const deviceId = await securityDevicesRepository.addDevice(newDevice);

    return deviceId;
  },
  async updateDevice(refreshToken: JWTPayloadModel, ip: string, userAgent: string): Promise<boolean> {
    const newDevice = {
      deviceId: refreshToken.deviceId,
      user_id: refreshToken.user_id,
      lastActiveDate: new Date(refreshToken.iat * 1000).toISOString(),
      expirationDate: refreshToken.exp,
      title: userAgent,
      ip: ip,
    };

    const isUpdated = await securityDevicesRepository.updateDevice(newDevice);
    return isUpdated;
  },
  async deleteOtherSecurityDevices(user_id: string, deviceId: string): Promise<boolean> {
    const isDeleted = await securityDevicesRepository.deleteDevices(user_id, deviceId);

    return isDeleted;
  },
  async deleteSecurityDevice(deviceId: string, user_id: string): Promise<ResultObject<boolean | null>> {
    const device = await securityDevicesRepository.findDevice(deviceId);

    const isOwner = device?.user_id === user_id;

    if (!isOwner) {
      return {
        status: ResultStatus.FORBIDDEN,
        errorMessage: "Access forbidden",
        data: null,
      };
    }
    const isDeleted = await securityDevicesRepository.deleteDevice(deviceId, user_id);
    return {
      status: isDeleted ? ResultStatus.SUCCESS : ResultStatus.FORBIDDEN,
      data: isDeleted,
    };
  },
};
