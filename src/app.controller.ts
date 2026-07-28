import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators';

@Controller()
@ApiTags('Health')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Public()
	@Get()
	@ApiOperation({
		summary: 'Verifica a disponibilidade da API',
		description:
			'Retorna a identificação da aplicação, permitindo confirmar que o serviço está no ar. Rota pública.',
	})
	@ApiOkResponse({
		description: 'Aplicação disponível.',
		schema: {
			example: {
				name: 'TMDB',
				version: 'TMDB Backend v1.0.0',
				environment: 'local',
				status: 'ok',
			},
		},
	})
	getInfo() {
		return this.appService.getInfo();
	}
}
