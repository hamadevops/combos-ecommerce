# Backend Development Rules & Guidelines

This document outlines the development standards and architectural patterns for the backend project.

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: MikroORM
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger (@nestjs/swagger)
- **Authentication**: JWT (Passport)
- **Queue**: BullMQ
- **Cache**: Redis (@nestjs/cache-manager)
- **Storage**: MinIO
- **Package Manager**: pnpm

---

## Development Standards

### Module Structure
Each feature should be encapsulated in its own module within `src/modules/`.
```
src/modules/feature-name/
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── feature.controller.ts
├── feature.module.ts
└── feature.service.ts
```

### Database Entities
- Entities are located in `src/database/entities/`.
- Use MikroORM decorators (`@Entity`, `@Property`, `@PrimaryKey`).
- Entity names should be singular (e.g., `Popup`, `Product`).

### DTOs (Data Transfer Objects)
- All request payloads must have a corresponding DTO.
- Use `class-validator` decorators for validation (`@IsString()`, `@IsOptional()`).
- Use `@nestjs/swagger` decorators (`@ApiProperty`) for documentation.
- Use `class-transformer` (`@Transform`) to handle type conversion, especially for `multipart/form-data` requests.

### Controllers
- Use standard HTTP methods (`@Get`, `@Post`, `@Patch`, `@Delete`).
- Wrap responses in standard DTOs where applicable.
- Use `@UseInterceptors(CacheInterceptor)` for GET requests where appropriate.
- Annotate endpoints with Swagger decorators (`@ApiOperation`, `@ApiOkResponse`).

### Queue Management
- **Critical**: When updating or deleting data that triggers background jobs or uses queues (e.g., BullMQ), you **MUST** ensure related jobs are removed or the queue is cleaned up to prevent processing obsolete data.


---

## Workflow for New Features

1.  **Define the Entity**: Create the entity class in `src/database/entities/`.
2.  **Create the Module**: Generate the module, service, and controller.
3.  **Create DTOs**: Define DTOs with strict validation and Swagger documentation.
4.  **Run Migrations**: Use `pnpm db:create` to generate a migration and `pnpm db:up` to apply it.
