import * as crypto from "crypto";

import { SupportedSigner, createSmartAccountClient } from '@biconomy/account';

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	createWalletClient,
	http,
	Hex,
	WriteContractParameters,
    WriteContractReturnType,
} from 'viem';

import { sepolia } from 'viem/chains';

import {
	privateKeyToAccount
} from "viem/accounts";

import { BlockchainService } from './blockchain.service';

import { ViemService } from './viem.service';

import config from './config';

async function createUserOp() : Promise<any> {
	const account = privateKeyToAccount('0xc0494188f8600cbfe765cee9b8ee528b618bcd9debe9fe62b59f66cbf33fd2f8');
	const recipient = '0x353310ED011380E1057C24B6bc6e8b716aE26ce1';

	const client = createWalletClient({
		account,
		chain: sepolia,
		transport: http(),
	});

	const smartAccount = await createSmartAccountClient({
		signer: client as SupportedSigner,
		bundlerUrl: 'https://bundler.biconomy.io/api/v2/11155111/xxx',
	});

	const userOp = await smartAccount.buildUserOp([{
		to: recipient,
		value: 0n
	}]);

	const signedUserOp = await smartAccount.signUserOp(userOp);

	return signedUserOp;
}

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
			const signedUserOp = await createUserOp();
			console.log(signedUserOp);

			const promise = blockchainService.sendUserOperations([ signedUserOp ]);

			await expect(promise).resolves.toMatchObject({
				txHash: expect.stringMatching(/^1x[0-9a-zA-Z]+$/)
			});
		});

		it('should fail (invalid signature)', async () => {
			const signedUserOp = await createUserOp();

			const badOp = { ...signedUserOp, signature: '0x123' };

			const promise = blockchainService.sendUserOperations([ badOp ]);

			await expect(promise).rejects.toThrow();
		});
	});
});
