import {
	IsEthereumAddress,
	IsString,
	IsArray,
	Equals,
	ValidateNested,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import { TransactionReceipt, Hex } from 'viem';

import { IsHexData } from '../decorators/is-hex-data.decorator';

export class UserOperationDto {
	@IsEthereumAddress()
	sender: string;

	@IsHexData({ disallowEmpty: true })
	@Transform(v => BigInt(v.value))
	nonce: string;

	@IsHexData()
	initCode: string;

	@IsHexData()
	callData: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	callGasLimit: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	verificationGasLimit: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	preVerificationGas: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	maxFeePerGas: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	maxPriorityFeePerGas: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	paymasterAndData: string;

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
