import type { ValidationResult } from '#/features/validator';

export let validationData: ValidationResult[] | null = null;
export let localHeaders: string[] = [];
export let dapodikHeaders: string[] = [];

export function setValidationData(data: ValidationResult[]) {
  validationData = data;
}

export function setHeaders(local: string[], dapodik: string[]) {
  localHeaders = local;
  dapodikHeaders = dapodik;
}
