import { Injectable, Logger } from '@nestjs/common';

import {
	Address,
	Abi,
	Hex,
} from 'viem';

import * as erc4337Abi from './abis/erc4337.json';
import * as entryPointAbi from './abis/entry-point.json';

import { ViemService } from './viem.service';

import { UserOperationDto } from './dto/user-operation.dto';

@Injectable()
export class BlockchainService {
	private readonly logger = new Logger(BlockchainService.name);

	constructor(
		readonly viemService: ViemService,
	) {};

	async sendUserOperations(
		userOperations: UserOperationDto[],
	) : Promise<Hex> {
		this.logger.log('Forwarding user operations...', userOperations);

		const txHash = await this.viemService.writeContract({
			address: this.viemService.getEntryPoint(),
			abi: erc4337Abi as Abi,
			functionName: 'handleOps',
			account: this.viemService.getAccount(),
			chain: this.viemService.getChain(),
			args: [
				userOperations,
				'0x962718024f19A40959Dc25f1546216b3293F1DA1'
			]
		});

		return txHash;
	}

	async getNonce(
		address: Address,
	) : Promise<bigint> {
		const nonce = await this.viemService.readContract({
			address: this.viemService.getEntryPoint(),
			abi: entryPointAbi as Abi,
			functionName: 'getNonce',
			args: [ address, 0n ]
		});

		return nonce as bigint;
	}
}
