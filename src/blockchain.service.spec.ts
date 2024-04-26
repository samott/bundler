import * as crypto from "crypto";

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

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

import { createUserOp } from './test/utils';

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
			const signedUserOp = await createUserOp(configService);

			const promise = blockchainService.sendUserOperations([ signedUserOp ]);

			await expect(promise).resolves.toMatch(expect.stringMatching(/^1x[0-9a-zA-Z]+$/));
		});

		it('should fail (invalid signature)', async () => {
			const signedUserOp = await createUserOp(configService);

			const badOp = { ...signedUserOp, signature: '0x123' };

			const promise = blockchainService.sendUserOperations([ badOp ]);

			await expect(promise).rejects.toThrow();
		});
	});
});
