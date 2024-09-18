import { StatusCodes } from 'http-status-codes';

export interface IError {
  message: string;
  statusCode: number;
  status: string;
  comingFrom: string;
}

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  comingFrom: string;
  serializeError(): IError;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;
  comingfrom: string;

  constructor(messgage: string, comingFrom: string) {
    super(messgage);
    this.comingfrom = comingFrom;
  }

  serializeError(): IError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      comingFrom: this.comingfrom,
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class FileTooLargeError extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class ServerError extends CustomError {
  statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export interface ErrNumException extends Error {
  errNum?: string;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}
