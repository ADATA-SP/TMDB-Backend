import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LdapModule } from 'src/ldap/ldap.module';
import { LdapService } from 'src/ldap/ldap.service';
import { UsersRepository } from './users.repository';

@Module({
	imports: [LdapModule],
	controllers: [UsersController],
	providers: [UsersService, LdapService, UsersRepository],
})
export class UsersModule {}
