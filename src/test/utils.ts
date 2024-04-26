import { SupportedSigner, createSmartAccountClient } from '@biconomy/account';

import { ConfigService } from '@nestjs/config';

import {
	createWalletClient,
	http,
	Hex,
} from 'viem';

import {
	privateKeyToAccount
} from "viem/accounts";

import { sepolia } from 'viem/chains';

export async function createUserOp(configService: ConfigService) : Promise<any> {
	// Send 0 ETH to self
	const account = privateKeyToAccount(configService.get<Hex>('test.endUser.privateKey'));
	const recipient = account.address;

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
