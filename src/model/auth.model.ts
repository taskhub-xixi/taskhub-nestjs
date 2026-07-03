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
  @MinLength(8)
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
  @MinLength(8)
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
  @Min(8)
  @Max(100)
  email?: string;

  @IsString()
  @Min(8)
  @Max(100)
  password?: string;

  @IsString()
  @Min(8)
  @Max(100)
  passwordChanged?: string;

  @IsString()
  @IsNotEmpty()
  @Min(3)
  @Max(100)
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
  @IsEmpty()
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

// REGISTER DTO --> logic code
// // validate
//     if (!registerDTO.username || registerDTO.username.trim() === "") {
//       throw new HttpException("username cannot be empty", 401);
//     }
//
//     if (!registerDTO.email || registerDTO.email.trim() === "") {
//       throw new HttpException("email cannot be empty", 401);
//     }
//
//     if (!registerDTO.password || registerDTO.password.trim() === "") {
//       throw new HttpException("password cannot be empty", 401);
//     }
//
//     if (registerDTO.password.length < 8) {
//       throw new HttpException("password must be atleast 8 charachter", 401);
//     }
//
//     if (registerDTO.username.length < 2) {
//       throw new HttpException("username must be atleast 2 charachter", 401);
//     }
//
//     if (registerDTO.email.length < 8) {
//       throw new HttpException("email must be atleast 8 charachter", 401);
//     }

// LOGN DTO -> logic code
// // validate
// if (!loginDTO.email || loginDTO.email.trim() === "") {
//   throw new BadRequestException("email cannot be empty");
// }
// if (!loginDTO.password || loginDTO.password.trim() === "") {
//   throw new BadRequestException("password cannot be empty");
// }
// if (loginDTO.password.length < 8) {
//   throw new BadRequestException("password minimum is 8 charachter");
// }
// if (loginDTO.email.length < 8) {
//   throw new BadRequestException("email minimum is 8 charachter");
// }

// RESET DTO -> logic code

// if (!resetDTO.email || resetDTO.email.trim() === "") {
//         throw new BadRequestException("email cannot be empty");
//       }
//       if (!resetDTO.password || resetDTO.password.trim() === "") {
//         throw new BadRequestException("password cannot be empty");
//       }
//       if (!resetDTO.passwordChanged || resetDTO.passwordChanged.trim() === "") {
//         throw new BadRequestException("repeat password cannot be empty");
//       }
//       if (resetDTO.email.length < 8) {
//         throw new BadRequestException("email must be atleast 8 charachter");
//       }
//       if (resetDTO.password.length < 8) {
//         throw new BadRequestException("password must be atleast 8 charachter");
//       }
//       if (resetDTO.passwordChanged.length < 8) {
//         throw new BadRequestException(
//           "repeat password must be atleast 8 charachter",
//         );
//       }
//       if (resetDTO.password !== resetDTO.passwordChanged) {
//         throw new BadRequestException(
//           "password and repeat password is not the same",
//         );
//       }

// DELETE DTO -> logic code

//
// if (!email || email.trim() === "") {
//   throw new BadRequestException("email cannot be empty");
// }
// if (!password || password.trim() === "") {
//   throw new BadRequestException("password cannot be empty");
// }
// if (password.length < 8) {
//   throw new BadRequestException("password must be atleast 8 charachter");
// }
// if (email.length < 8) {
//   throw new BadRequestException("email must be atleast 8 charachter");
// }
// if (!confPassword || confPassword.trim() === "") {
//   throw new BadRequestException("cofirmation password cannot be empty");
// }
// if (confPassword.length < 8) {
//   throw new BadRequestException(
//     "confirmation password must be atleast 8 charachter",
//   );
// }
// if (confPassword !== password) {
//   throw new BadRequestException(
//     "confirmation password and password is not same",
//   );
// }
