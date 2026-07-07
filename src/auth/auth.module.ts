import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserStrategy } from "../common/strategies/admin.strategy";
import { AtStrategy } from "../common/strategies/at.strategy";
import { JwtStrategy } from "../common/strategies/jwt.strategy";
import { RtStrategy } from "../common/strategies/rt.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./services/token.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService): { secret: string | undefined } => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserStrategy,
    JwtStrategy,
    RtStrategy,
    AtStrategy,
    TokenService,
    JwtService,
  ],
  exports: [
    AuthService,
    UserStrategy,
    JwtStrategy,
    RtStrategy,
    AtStrategy,
    TokenService,
    JwtService,
  ],
})
export class AuthModule {}
