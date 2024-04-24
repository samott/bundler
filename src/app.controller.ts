import { Hex } from 'viem';

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
				jsonRpcUserOperationDto.params,
				this.configService.get<string>('entryPoint') as Hex
			);

			return {
				jsonrpc: '2.0',
				method: 'eth_sendUserOperation',
				result
			};
		} catch (e) {
			throw new InternalServerErrorException('Internal error');
		}
	}
}
