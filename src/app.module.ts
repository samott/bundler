import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule } from '@nestjs/config';

import { ViemService } from './viem.service';
import { BlockchainService } from './blockchain.service';

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
		ViemService,
		IsHexDataValidator,
		BlockchainService,
	],
})
export class AppModule {}
