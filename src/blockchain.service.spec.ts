import * as crypto from "crypto";

import { createGasEstimator } from "entry-point-gas-estimations";

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	createWalletClient,
	encodeFunctionData,
	http,
	Hex,
	Address,
	WriteContractParameters,
    WriteContractReturnType,
} from 'viem';

import { sepolia } from 'viem/chains';

import {
	privateKeyToAccount
} from "viem/accounts";

import { BlockchainService } from './blockchain.service';

import { ViemService } from './viem.service';

import { getUserOpHash, encodeUserOpSignature } from './utils/utils';

import * as erc20Abi from './abis/erc20.json';
import * as accountAbi from './abis/smart-account.json';

import config from './config';

async function writeContractMock(
	params: WriteContractParameters
) : Promise<WriteContractReturnType> {
	const client = createPublicClient({
		chain: sepolia,
		transport: http(),
	});

	await client.simulateContract({
		...params,
		account: this.getAccount()
	});

	const txHash = '0x' + crypto.randomBytes(32).toString("hex");

	return txHash as Hex;
}

describe('BlockchainService', () => {
	let module: TestingModule;
	let blockchainService: BlockchainService;
	let viemService: ViemService;
	let configService: ConfigService;

	const gasEstimator = createGasEstimator({
		rpcUrl: 'https://rpc.sepolia.org/',
	});

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					cache: true,
					load: [config],
				}),
			]
		}).compile();

		await module.init();

		configService = module.get<ConfigService>(ConfigService);

		viemService = new ViemService(configService);
		blockchainService = new BlockchainService(viemService);

		jest.spyOn(viemService, 'writeContract').mockImplementation(writeContractMock);
	});

	describe('sendUserOperations', () => {
		it('should run successfully', async () => {
			const sender : Hex = "0xF7197fB76E0287314AE6D82aC8C24f992b3a20e1";
			const gasFees = await viemService.getGasFees();

			const nonce = await blockchainService.getNonce(sender);

			const PLACEHOLDER_SIGNATURE = "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e0000000000000000000000000000000000000000000000000000000000000041743dea9e79b9534fb4c06c7efc9f4db5101ccab25ae4d8ae707f5b1f55acc19a46d7f7cb445b3311f81f14d72942d6be44def97ff66b095ccf47185fb35eaa641c00000000000000000000000000000000000000000000000000000000000000" as Hex;

			const WETH_CONTRACT = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9';
			const SPENDER = '0x353310ED011380E1057C24B6bc6e8b716aE26ce1';

			// Pre-created smart account
			const account = privateKeyToAccount('0xc0494188f8600cbfe765cee9b8ee528b618bcd9debe9fe62b59f66cbf33fd2f8');

			const approveCall = encodeFunctionData({
				abi: erc20Abi,
				functionName: 'approve',
				args: [ SPENDER, 1n ]
			});

			const callData = encodeFunctionData({
				abi: accountAbi,
				functionName: 'execute',
				args: [ WETH_CONTRACT, 0n, approveCall ]
			});

			const userOpBase = {
				sender,
				nonce,
				initCode: "0x" as Hex,
				callData,
				paymasterAndData: '0x' as Hex,
				maxFeePerGas: gasFees.maxFeePerGas,
				maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
				verificationGasLimit: 0n,
				callGasLimit: 0n,
				preVerificationGas: 0n,
				signature: PLACEHOLDER_SIGNATURE
			};

			const gasEstimates = await gasEstimator.estimateUserOperationGas({
				userOperation: userOpBase
			});

			const userOp = {
				...userOpBase,
				verificationGasLimit: gasEstimates.verificationGasLimit,
				callGasLimit: gasEstimates.callGasLimit,
				preVerificationGas: gasEstimates.preVerificationGas,
			};

			const walletClient = createWalletClient({
				account,
				chain: sepolia,
				transport: http()
			});

			const entryPoint = configService.get<string>('onChain.entryPoint') as Address;
			const userOpHash = getUserOpHash(userOp, sepolia, entryPoint);

			const signature = await walletClient.signMessage({
				account,
				message: {
					raw: userOpHash
				}
			}) as Hex;

			const encSignature = encodeUserOpSignature(signature, entryPoint);

			const promise = blockchainService.sendUserOperations([{
				...userOp,
				signature: encSignature
			}]);

			expect(promise).resolves.not.toThrow();

			const result = await promise;

			expect(result.transactionHash).toBeDefined();
		});
	});
});
