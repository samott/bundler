import { Injectable } from '@nestjs/common';

import {
	Address,
	TransactionReceipt,
	Abi,
} from 'viem';

import erc4337Abi from './abis/erc4337.json';
import entryPointAbi from './abis/entry-point.json';

import { ViemService } from './viem.service';

import { UserOperationDto } from './dto/user-operation.dto';

@Injectable()
export class BlockchainService {
	constructor(
		readonly viemService: ViemService,
	) {};

	async sendUserOperations(
		userOperations: UserOperationDto[],
		entryPoint: Address
	) : Promise<TransactionReceipt> {
		const txHash = await this.viemService.writeContract({
			address: entryPoint,
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
}
