import { authService } from '@gateway/services/api.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class CurrentUser {
  public async read(_req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.getCurrentUser();
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }

  public async resendEmail(_req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.getCurrentUser();

    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }
}
