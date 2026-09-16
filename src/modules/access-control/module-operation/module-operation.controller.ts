import { Controller, Get, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ModuleOperationService } from './module-operation.service';
import { ApiAuthResponses } from '../../../common/decorators';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';

@Controller('modules')
@ApiTags('Modules')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ModuleOperationController {
	constructor(
		private readonly moduleOperationService: ModuleOperationService,
	) {}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.READ))
	@ApiOperation({
		summary: 'Lista os módulos e suas operações',
		description:
			'Retorna os módulos ativos do sistema com as operações que cada um oferece. É a base para montar a tela de permissões por perfil.',
	})
	@ApiOkResponse({
		description: 'Módulos ativos com suas operações.',
		schema: {
			example: [
				{
					id: 1,
					description: 'Usuários',
					slug: 'users',
					status: 1,
					created_at: '2026-09-15T13:00:00.000Z',
					updated_at: '2026-09-15T13:00:00.000Z',
					operations: [
						{
							id: 1,
							description: 'Criar Usuários',
							identifier: 'create-users',
							status: 1,
							module_id: 1,
						},
					],
				},
			],
		},
	})
	findAll() {
		return this.moduleOperationService.findAll();
	}
}
