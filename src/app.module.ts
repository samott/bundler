import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';

import {
	IsHexDataValidator
} from './decorators/is-hex-data.decorator';

import config from './config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [config],
		}),
	],
	controllers: [AppController],
	providers: [
		IsHexDataValidator,
	],
})
export class AppModule {}
