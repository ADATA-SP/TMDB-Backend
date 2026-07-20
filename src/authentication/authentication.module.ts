import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LdapModule } from 'src/ldap/ldap.module';
import { LdapService } from 'src/ldap/ldap.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from 'src/common/strategies';
import { UsersRepository } from 'src/modules/users/users.repository';

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
