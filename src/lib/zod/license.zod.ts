import { z } from "zod";
import { getBaseReturnSchema } from "./helpers";

export const hardwareInfoSchema = z.object({
  cpuModel: z.string(),
  cpuCores: z.number(),
  platform: z.string(),
  arch: z.string(),
  macAddresses: z.array(z.string()),
  machineId: z.string()
});

export type HardwareInfo = z.infer<typeof hardwareInfoSchema>;

export const licenseDataSchema = z.object({
  serialKey: z.string(),
  hardwareId: z.string(),
  activatedAt: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  lastValidated: z.string().optional()
});

export type LicenseData = z.infer<typeof licenseDataSchema>;

export const activationResultSchema = z.object({
  serialKey: z.string(),
  expiresAt: z.string().optional().nullable(),
  activatedAt: z.string()
});

export const activationResponseSchema = getBaseReturnSchema(
  activationResultSchema
);

export type ActivationResponse = z.infer<typeof activationResponseSchema>;

export const validationResultSchema = z.object({
  valid: z.boolean()
});

export const validationResponseSchema = getBaseReturnSchema(
  validationResultSchema
);

export type ValidationResponse = z.infer<typeof validationResponseSchema>;

const checkLicenseSchema = z.object({
  licensed: z.boolean(),
  error: z.string().optional(),
  needsActivation: z.boolean().optional()
});

export type CheckLicense = z.infer<typeof checkLicenseSchema>;

export const getLicenseInfoSchema = z.object({
  isLicensed: z.boolean(),
  serialKey: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  activatedAt: z.string().optional()
});

export type GetLicenseInfo = z.infer<typeof getLicenseInfoSchema>;
