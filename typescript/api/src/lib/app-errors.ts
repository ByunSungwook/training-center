/**
 * 도메인 로직에서 발생하는 예외에 한하여 사용합니다.
 * 예외 구분 코드는 must를 사용하여 만들면 좋습니다.
 *
 * @param code 예외 구분 코드 (예. `duration-must-be-above-5-minutes`, `reservation-must-not-be-in-past`)
 * @param message 예외 메시지
 * @param options {@link ErrorOptions}
 *
 * @example
 * ```ts
 * throw new Exception('duration-must-be-above-5-minutes', '지속시간은 5분 이상이어야 합니다.');
 * ```
 */
export abstract class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AppError';
  }
}

export class InvariantError extends AppError {
  constructor(
    public code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'InvariantError';
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NotFoundError';
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UnauthenticatedError';
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PermissionDeniedError';
  }
}

export class AdapterError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AdapterError';
  }
}
