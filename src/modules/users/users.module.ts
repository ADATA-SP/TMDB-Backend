import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LdapModule } from '../../ldap/ldap.module';
import { LdapService } from '../../ldap/ldap.service';
import { UsersRepository } from './users.repository';

@Module({
	imports: [LdapModule],
	controllers: [UsersController],
	providers: [UsersService, LdapService, UsersRepository],
})
export class UsersModule {}
