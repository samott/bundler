import crypto from "crypto";

import { createGasEstimator } from "entry-point-gas-estimations";

import { ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	http,
	Hex,
	WriteContractParameters,
    WriteContractReturnType,
} from 'viem';

import { sepolia } from 'viem/chains';

import { BlockchainService } from './blockchain.service';

import { ViemService } from './viem.service';

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import config from './config';

async function writeContractMock(
	params: WriteContractParameters
) : Promise<WriteContractReturnType> {
	const client = createPublicClient({
		chain: sepolia,
		transport: http(),
	});
	console.log(params);

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
});
