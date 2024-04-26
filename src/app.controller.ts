import { BaseError } from 'viem';

import { Logger } from '@nestjs/common';

import {
	Controller,
	Post,
	Body,
	UseFilters,
	InternalServerErrorException,
	BadRequestException,
} from '@nestjs/common';

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
		private readonly blockchainService: BlockchainService
	) {}

	@Post('/rpc')
	async jsonRpcRequest(
		@Body() jsonRpcUserOperationDto: JsonRpcUserOperationDto
	) : Promise<JsonRpcResponseDto> {
		try {
			const txHash = await this.blockchainService.sendUserOperations(
				jsonRpcUserOperationDto.params
			);

			return {
				jsonrpc: '2.0',
				id: jsonRpcUserOperationDto.id,
				method: 'eth_sendUserOperation',
				result: {
					txHash,
					status: 'submitted'
				}
			};
		} catch (e) {
			this.logger.warn(e);

			if (e instanceof BaseError)
				throw new BadRequestException(e.shortMessage);
			throw new InternalServerErrorException('Internal error');
		}
	}
}
