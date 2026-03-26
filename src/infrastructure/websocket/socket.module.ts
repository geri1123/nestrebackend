import { Module } from "@nestjs/common";
import { SocketAuthService } from "./socket-auth.service";
import { SocketConnectionService } from "./socket-connection.service";
import { SocketRateLimitService } from "./socket-rate-limit.service";
import { AppConfigModule } from "../config/config.module";
import { SharedAuthModule } from "../auth/modules/shared-auth.module";

@Module({
    imports:[AppConfigModule , SharedAuthModule ],
  providers:[SocketAuthService , SocketConnectionService, SocketRateLimitService],
  exports:[SocketAuthService , SocketConnectionService, SocketRateLimitService]
})
export class WebSocketModule {}