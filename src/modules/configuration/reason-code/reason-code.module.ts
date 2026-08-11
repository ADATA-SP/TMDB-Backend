import { Module } from '@nestjs/common';
import { ReasonCodeController } from './reason-code.controller';
import { ReasonCodeService } from './reason-code.service';

@Module({
	controllers: [ReasonCodeController],
	providers: [ReasonCodeService],
})
export class ReasonCodeModule {}
