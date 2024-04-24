import { Injectable } from '@nestjs/common';

import {
	createPublicClient,
	createWalletClient,
	Account,
	Address,
	TransactionReceipt,
} from 'viem';

import erc4337Abi from './abis/erc4337.json';

import { UserOperationDto } from './dto/user-operation.dto';

type CombinedClient =
	ReturnType<typeof createPublicClient>
		& ReturnType<typeof createWalletClient>;

@Injectable()
export class BlockchainService {
	constructor(
		readonly client: CombinedClient,
		readonly account: Account,
	) {};

	async sendUserOperations(
		userOperations: UserOperationDto[],
		entryPoint: Address
	) : Promise<TransactionReceipt> {
		const txHash = await this.client.writeContract({
			address: entryPoint,
			abi: erc4337Abi,
			functionName: 'entryPoint',
			account: this.account,
			chain: this.client.chain,
			args: userOperations
		});

		const receipt = await this.client.waitForTransactionReceipt({
			hash: txHash
		});

		return receipt;
	}
}
