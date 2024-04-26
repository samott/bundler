import {
	IsEthereumAddress,
	IsDefined,
	IsString,
	IsArray,
	Equals,
	ValidateNested,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import { TransactionReceipt, Address, Hex } from 'viem';

import { IsHexData } from '../decorators/is-hex-data.decorator';

export class UserOperationDto {
	@IsDefined()
	@IsEthereumAddress()
	sender: Address;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	nonce: bigint;

	@IsDefined()
	@IsHexData()
	initCode: Hex;

	@IsDefined()
	@IsHexData()
	callData: Hex;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	callGasLimit: bigint;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	verificationGasLimit: bigint;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	preVerificationGas: bigint;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	maxFeePerGas: bigint;

	@IsDefined()
	@Transform(v => BigInt(v.value))
	maxPriorityFeePerGas: bigint;

	@IsDefined()
	@IsHexData()
	paymasterAndData: Hex;

	@IsDefined()
	@IsHexData({ disallowEmpty: true })
	signature: Hex;
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
