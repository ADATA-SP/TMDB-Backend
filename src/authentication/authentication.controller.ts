import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { AuthToken, GetCurrentUser, Public } from 'src/common/decorators';
import { UserPayloadProps } from 'src/common/types';

@Controller('authentication')
@ApiTags('Authentication')
@ApiBearerAuth('JWT-auth')
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService,
	) {}

	@Post('sign-in')
	@Public()
	signIn(@Body() signDto: SignInDto) {
		return this.authenticationService.signIn(signDto);
	}

	@Post('whoami')
	whoami(
		@GetCurrentUser() currentUser: UserPayloadProps,
		@AuthToken() authToken: string,
	) {
		return this.authenticationService.whoami(currentUser, authToken);
	}
}
