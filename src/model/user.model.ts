import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { SortOrder } from "../generated/prisma/internal/prismaNamespace";

export class UpdateUserRequest {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class UpdateUserResponse {
  users!: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
}

export class GetUserResponse {
  users!: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
}

export class GetUserById {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class GetUserByEmail {
  @IsString()
  @IsNotEmpty()
  email!: string;
}

export class User {
  user!: {
    sub: string;
    email: string;
  };
}

export class UserResponse {
  users!: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
}

export class ListQueryRequest {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  order?: SortOrder;
}

export class RequestQuery {
  query!: unknown;
}

export class UserResponseAll {
  user?: unknown;
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: Date;
}

export class GetAllUserResponse {
  users!: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  }[];
  pagination!: {
    page: number;
    limit: number;
    total_users: number;
    total_pages: number;
  };
}
