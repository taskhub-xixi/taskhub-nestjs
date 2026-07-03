import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CheckRequest = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const queryParam = req.query;
    return queryParam;
  },
);
