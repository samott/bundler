import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	createWalletClient,
	publicActions,
	http,
	Hex,
	Account,
	ReadContractParameters,
    ReadContractReturnType,
	WriteContractParameters,
    WriteContractReturnType,
	WaitForTransactionReceiptParameters,
	WaitForTransactionReceiptReturnType,
} from 'viem';

import { privateKeyToAccount } from 'viem/accounts';

import {
	sepolia
} from 'viem/chains';

@Injectable()
export class ViemService {
	constructor(
		private readonly configService: ConfigService
	) {}

	async readContract(
		params: ReadContractParameters
	) : Promise<ReadContractReturnType> {
		const client = createPublicClient({
			chain: sepolia,
			transport: http(),
		});

		return client.readContract(params);
	}

	async writeContract(
		params: WriteContractParameters
	) : Promise<WriteContractReturnType> {
		const client = createWalletClient({
			account: this.getAccount(),
			chain: sepolia,
			transport: http(),
		}).extend(publicActions);

		return client.writeContract(params);
	}

	async waitForTransactionReceipt(
		params: WaitForTransactionReceiptParameters
	) : Promise<WaitForTransactionReceiptReturnType> {
		const client = createPublicClient({
			chain: sepolia,
			transport: http(),
		}).extend(publicActions);

		return client.waitForTransactionReceipt(params);
	}

	getAccount() : Account {
		const privateKey = this.configService.get<string>('onChain.privateKey') as Hex;
		return privateKeyToAccount(privateKey);
	}

	getEntryPoint() : Hex {
		return this.configService.get<string>('onChain.entryPoint') as Hex;
	}

	getBeneficiary() : Hex {
		return this.configService.get<string>('onChain.beneficiary') as Hex;
	}

	getChain() {
		return sepolia;
	}
}
