import { Injectable } from '@nestjs/common';

import {
	Address,
	TransactionReceipt,
	Abi,
} from 'viem';

import * as erc4337Abi from './abis/erc4337.json';
import * as entryPointAbi from './abis/entry-point.json';

import { ViemService } from './viem.service';

import { UserOperationDto } from './dto/user-operation.dto';

@Injectable()
export class BlockchainService {
	constructor(
		readonly viemService: ViemService,
	) {};

	async sendUserOperations(
		userOperations: UserOperationDto[],
	) : Promise<TransactionReceipt> {
		const txHash = await this.viemService.writeContract({
			address: this.viemService.getEntryPoint(),
			abi: erc4337Abi as Abi,
			functionName: 'entryPoint',
			account: this.viemService.getAccount(),
			chain: this.viemService.getChain(),
			args: userOperations
		});

		const receipt = await this.viemService.waitForTransactionReceipt({
			hash: txHash
		});

		return receipt;
	}

	async getNonce(
		address: Address,
	) : Promise<BigInt> {
		const nonce = await this.viemService.readContract({
			address: this.viemService.getEntryPoint(),
			abi: entryPointAbi as Abi,
			functionName: 'getNonce',
			args: [ address, 0n ]
		});

		return nonce as BigInt;
	}
}
