import {
	IsEthereumAddress,
	IsString,
	IsArray,
	Equals,
	ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { TransactionReceipt } from 'viem';

import { IsHexData } from '../decorators/is-hex-data.decorator';

export class UserOperationDto {
	@IsEthereumAddress()
	sender: string;

	@IsHexData({ disallowEmpty: true })
	nonce: string;

	@IsHexData()
	initCode: string;

	@IsHexData()
	callData: string;

	@IsHexData()
	callGasLimit: string;

	@IsHexData()
	verificationGasLimit: string;

	@IsHexData()
	preVerificationGas: string;

	@IsHexData()
	preVerificationGas: string;

	@IsHexData()
	maxFeePerGas: string;

	@IsHexData()
	maxPriorityFeePerGas: string;

	@IsHexData({ disallowEmpty: true })
	signature: string;
}

export class JsonRpcUserOperationDto {
	@IsString()
	@Equals('2.0')
	jsonrpc: string;

	@IsString()
	@Equals('eth_sendUserOperation')
	method: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserOperationDto)
	params: UserOperationDto[];
}

export class JsonRpcResponseDto {
	@IsString()
	@Equals('2.0')
	jsonrpc: string;

	@IsString()
	@Equals('eth_sendUserOperation')
	method: string;

	result: TransactionReceipt;
}
