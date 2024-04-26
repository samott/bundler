import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	createWalletClient,
	publicActions,
	http,
	Hex,
	Account,
	FeeValues,
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

		return await client.waitForTransactionReceipt(params);
	}

	async getGasFees() : Promise<FeeValues> {
		const client = createPublicClient({
			chain: sepolia,
			transport: http(),
		});

		const feeData = await client.estimateFeesPerGas();
		return feeData;
	}

	getAccount() : Account {
		const privateKeys = this.configService.get<Hex[]>('onChain.privateKeys');
		const index = Math.floor(Math.random() * privateKeys.length);
		return privateKeyToAccount(privateKeys[index]);
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
