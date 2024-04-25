import {
	IsEthereumAddress,
	IsString,
	IsArray,
	Equals,
	ValidateNested,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import { TransactionReceipt, Address, Hex } from 'viem';

import { IsHexData } from '../decorators/is-hex-data.decorator';

export class UserOperationDto {
	@IsEthereumAddress()
	sender: Address;

	@IsHexData({ disallowEmpty: true })
	@Transform(v => BigInt(v.value))
	nonce: BigInt;

	@IsHexData()
	initCode: Hex;

	@IsHexData()
	callData: string;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	callGasLimit: bigint;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	verificationGasLimit: bigint;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	preVerificationGas: bigint;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	maxFeePerGas: bigint;

	@IsHexData()
	@Transform(v => BigInt(v.value))
	maxPriorityFeePerGas: bigint;

	@IsHexData()
	paymasterAndData: Hex;

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
