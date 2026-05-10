import { SetMetadata } from '@nestjs/common';
export const CUSTOM_MESSAGE = 'CUSTOM_MESSAGE';
export const CustomMessage = (message: string) =>
  SetMetadata(CUSTOM_MESSAGE, message);
