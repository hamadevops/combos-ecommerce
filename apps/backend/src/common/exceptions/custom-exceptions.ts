// src/common/exceptions/custom-exceptions.ts
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export class CustomNotFoundException extends NotFoundException {
  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class CustomBadRequestException extends BadRequestException {
  constructor(message = 'Invalid request') {
    super(message);
  }
}

export class CustomUnauthorizedException extends UnauthorizedException {
  constructor(message = 'Unauthorized or access denied') {
    super(message);
  }
}

export class CustomForbiddenException extends ForbiddenException {
  constructor(message = 'Access forbidden') {
    super(message);
  }
}

export class CustomInternalServerErrorException extends InternalServerErrorException {
  constructor(message = 'Internal server error') {
    super(message);
  }
}
