import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from '../common/strategies';
import { UsersRepository } from '../modules/users/users.repository';

@Module({
	imports: [LdapModule, JwtModule.register({})],
	controllers: [AuthenticationController],
	providers: [
		AuthenticationService,
		LdapService,
		AtStrategy,
		UsersRepository,
	],
})
export class AuthenticationModule {}
