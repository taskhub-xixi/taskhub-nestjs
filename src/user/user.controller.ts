import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Admin, Public } from "../common/decorator";
import { AdminGuard, JwtAuthGuard } from "../common/guards";
import { PublicGuard } from "../common/guards/public.guards";
import {
  GetAllUserResponse,
  GetUserById,
  GetUserResponse,
  ListQueryRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  User,
} from "../model/user.model";
import { WebResponse } from "../model/web.mode";
import { IUserRepository } from "./interfaces/user.interface";
import { UserService } from "./user.service";

@Controller("/api/users")
export class UserController implements IUserRepository {
  constructor(private readonly userService: UserService) {}

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("me")
  async me(@Req() req: User): Promise<WebResponse<GetUserResponse>> {
    const result = await this.userService.me(req.user.email);
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch("me")
  async updateUser(
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UpdateUserResponse>> {
    const result = await this.userService.updateUser(request);
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUser(
    @Query() query: ListQueryRequest,
  ): Promise<WebResponse<GetAllUserResponse>> {
    const result = await this.userService.getAllUser(query);
    return {
      data: result,
      paging: {
        currentPage: result.pagination.page,
        totalPage: result.pagination.total_pages,
        pageSize: result.pagination.limit,
        totalItem: result.pagination.total_users,
      },
      statusCode: HttpStatus.OK,
    };
  }

  @Admin()
  @Public()
  @UseGuards(AdminGuard)
  @UseGuards(PublicGuard)
  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Req() request: GetUserById,
  ): Promise<WebResponse<GetUserResponse>> {
    const result = await this.userService.getUserById(request.id);
    return {
      data: result,
      statusCode: HttpStatus.OK,
    };
  }
}
