import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(100)
  password!: string;
}

export class RegisterDTO {
  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  firstname!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  lastname!: string;
}

export class UpdateDTO {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  email?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(100)
  password?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(100)
  passwordChanged?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  usernameChanged?: string;
}

export class DeleteDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LogoutDTO {
  @IsEmail()
  email!: string;
}

export class CookiePayload {
  @IsString()
  @IsNotEmpty()
  refreshtoken!: string;

  @IsString()
  @IsEmpty()
  accessToken!: string;
}

export class UserResponse {
  username?: string;
  email?: string;
}

export class JWTResponse {
  access_token?: string;
  refresh_token?: string;
  exp?: Date;
  createdAt!: Date;
}

export class RegisterResponse {
  data!: {
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}

export class LoginResponse {
  refresh_token!: string;
  access_token!: string;
  expiresIn!: Date;
}

export class UpdateResponse {
  data!: {
    email: string;
  };
}

export class LogoutResponse {
  data!: {
    message: string;
  };
}

export class RefreshTokenResponse {
  refresh_token!: string;
  access_token!: string;
}

export class VerifyResponseToken {
  id!: number;
}
