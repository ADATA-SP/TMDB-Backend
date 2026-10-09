import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from '../common/strategies';
import { PortalSsoService } from './portal-sso.service';

@Module({
	imports: [JwtModule.register({})],
	controllers: [AuthenticationController],
	providers: [AuthenticationService, PortalSsoService, AtStrategy],
})
export class AuthenticationModule {}
