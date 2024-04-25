import {
	encodeAbiParameters,
	Address,
	Hex,
	Chain
} from 'viem';

import { keccak256 } from 'viem';

const UserOperationNoSigTypes = [
	{ type: 'address', name: 'sender' },
	{ type: 'uint256', name: 'nonce' },
	{ type: 'bytes32', name: 'initCode' },
	{ type: 'bytes32', name: 'callData' },
	{ type: 'uint256', name: 'callGasLimit' },
	{ type: 'uint256', name: 'verificationGasLimit' },
	{ type: 'uint256', name: 'preVerificationGas' },
	{ type: 'uint256', name: 'maxFeePerGas' },
	{ type: 'uint256', name: 'maxPriorityFeePerGas' },
	{ type: 'bytes32', name: 'paymasterAndData' },
];

export function getUserOpHash(
	userOperation: any,
	chain: Chain,
	entryPoint: Address
) : Hex {
	const userOpValues = UserOperationNoSigTypes.map(
		(t) => (t.type == 'bytes32')
			? keccak256(userOperation[t.name])
			: userOperation[t.name]
	);

	const encodedOp = encodeAbiParameters(UserOperationNoSigTypes, userOpValues);
	const encodedWithEp = encodeAbiParameters([
		{type: 'bytes32'},
		{type: 'address'},
		{type: 'uint256'}
	], [
		keccak256(encodedOp),
		entryPoint,
		BigInt(chain.id)
	]);

	return keccak256(encodedWithEp);
}

export function encodeUserOpSignature(
	signature: Hex,
	entryPoint: Address,
) : Hex {
	return encodeAbiParameters([
		{type: 'bytes'},
		{type: 'address'}
	], [
		signature,
		entryPoint
	]);
}
