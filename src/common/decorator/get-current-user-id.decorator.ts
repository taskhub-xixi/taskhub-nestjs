import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from "@nestjs/common";
import { JwtPayload } from "../../auth/interfaces/payload-interface";

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    if (!user.sub) {
      throw new HttpException("User undefined", 404);
    }
    return user.sub;
  },
);
