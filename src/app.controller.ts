import { Hex, BaseError } from 'viem';

import { Logger } from '@nestjs/common';

import { Controller, Post, Body, UseFilters, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { BlockchainService } from './blockchain.service';

import { JsonRpcExceptionFilter } from './filters/jsonrpc-exception.filter';

import {
	JsonRpcUserOperationDto,
	JsonRpcResponseDto,
} from './dto/user-operation.dto';

@Controller()
@UseFilters(JsonRpcExceptionFilter)
export class AppController {
	private readonly logger = new Logger(AppController.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly blockchainService: BlockchainService
	) {}

	@Post('/rpc')
	async jsonRpcRequest(
		@Body() jsonRpcUserOperationDto: JsonRpcUserOperationDto
	) : Promise<JsonRpcResponseDto> {
		try {
			const result = await this.blockchainService.sendUserOperations(
				jsonRpcUserOperationDto.params
			);

			return {
				jsonrpc: '2.0',
				method: 'eth_sendUserOperation',
				result
			};
		} catch (e) {
			this.logger.warn(e);
			throw new InternalServerErrorException('Internal error');
		}
	}
}
