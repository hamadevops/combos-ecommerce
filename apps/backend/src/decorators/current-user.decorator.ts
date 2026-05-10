import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from 'src/interfaces/current-user.interface';

/**
 * Decorator to extract the current authenticated user from the request
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: ICurrentUser) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
