// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { AppConfigModule } from '../../config/config.module';
// import { AppConfigService } from '../../config/config.service';
// import { AuthTokenService } from '../services/auth-token.service';
// @Module({
//   imports: [
//     AppConfigModule,
//     JwtModule.registerAsync({
//       imports: [AppConfigModule],
//       useFactory: async (configService: AppConfigService) => ({
//         secret: configService.jwtSecret,
//         signOptions: { expiresIn: '1d' },
//       }),
//       inject: [AppConfigService],
//     }),
//   ],
//   providers: [AuthTokenService],
//   exports: [JwtModule, AuthTokenService, AppConfigModule],
// })
// export class SharedAuthModule {}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../config/config.module';
import { AppConfigService } from '../../config/config.service';
import { AuthTokenService } from '../services/auth-token.service';
@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtAccessSecret,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthTokenService],
  exports: [JwtModule, AuthTokenService, AppConfigModule],
})
export class SharedAuthModule {}