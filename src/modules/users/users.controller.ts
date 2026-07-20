import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Put,
	Patch,
	ParseIntPipe,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchAccountNameDto } from './dto/search-user.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginate-response.decorator';
import { ListInputUserDto, ListOutputUserDto } from './dto/list-user.dto';
import { PaginateOutputDto } from '../../common/dto/paginate-output.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import { GetCurrentUser } from '../../common/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPayloadProps } from '../../common/types';
import { PermissionGuard } from '../../common/guards';
import { OperationsModule } from '../../common/constants';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.USERS.CREATE))
	create(
		@Body() createUserDto: CreateUserDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.create(createUserDto, currentUser);
	}

	@Get()
	@ApiPaginatedResponse(ListOutputUserDto)
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	findAll(
		@Query() listInputUserDto: ListInputUserDto,
	): Promise<PaginateOutputDto<ListOutputUserDto>> {
		return this.usersService.findAll(listInputUserDto);
	}

	@Get('search-account-name')
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	searchAccountName(@Query() searchAccountNameDto: SearchAccountNameDto) {
		return this.usersService.searchAccountName(searchAccountNameDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.UPDATE))
	update(
		@Param('id', ParseIntPipe) user_id: number,
		@Body() updateUserDto: UpdateUserDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.update(updateUserDto, user_id, currentUser);
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionGuard(OperationsModule.USERS.CHANGE_STATUS))
	changeStatus(@Param('id', ParseIntPipe) user_id: number) {
		return this.usersService.changeStatus(user_id);
	}

	@Put('change-password')
	@UseGuards(PermissionGuard(OperationsModule.USERS.UPDATE))
	changePassword(@Body() changePasswordDto: ChangePasswordUserDto) {
		return this.usersService.changePassword(changePasswordDto);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.DELETE))
	delete(
		@Param('id', ParseIntPipe) user_id: number,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.delete(user_id, currentUser);
	}
}
