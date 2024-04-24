import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import {
	IsHexDataValidator
} from './decorators/is-hex-data.decorator';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		IsHexDataValidator,
		AppService
	],
})
export class AppModule {}
