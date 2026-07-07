import { Response } from "express";
import {
  LoginDTO,
  LoginResponse,
  LogoutDTO,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterDTO,
  RegisterResponse,
} from "../../model/auth.model";
export abstract class IAuthService {
  abstract create(registerDTO: RegisterDTO): Promise<RegisterResponse>;
  abstract login(
    loginDTO: LoginDTO,
    response: Response,
  ): Promise<LoginResponse>;
  abstract logout(logoutDTO: LogoutDTO, res: Response): Promise<LogoutResponse>;
  abstract refresh(token: string, res: Response): Promise<RefreshTokenResponse>;
}
