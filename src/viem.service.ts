import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
	createPublicClient,
	createWalletClient,
	publicActions,
	http,
	Chain,
	Hex,
	Account,
	PublicClient,
	FeeValues,
	ReadContractParameters,
	ReadContractReturnType,
	WriteContractParameters,
	WriteContractReturnType,
	WaitForTransactionReceiptParameters,
	WaitForTransactionReceiptReturnType,
	EstimateContractGasParameters,
	EstimateContractGasReturnType,
} from 'viem';

import { privateKeyToAccount } from 'viem/accounts';

import * as chains from 'viem/chains';

@Injectable()
export class ViemService {
	private publicClient: PublicClient;

	constructor(
		private readonly configService: ConfigService
	) {
		this.publicClient = createPublicClient({
			chain: this.getChain(),
			transport: http(),
		});
	}

	async readContract(
		params: ReadContractParameters
	) : Promise<ReadContractReturnType> {

		return await this.publicClient.readContract(params);
	}

	async writeContract(
		params: WriteContractParameters
	) : Promise<WriteContractReturnType> {
		const client = createWalletClient({
			account: this.getAccount(),
			chain: this.getChain(),
			transport: http(),
		}).extend(publicActions);

		return await client.writeContract(params);
	}
	async estimateContractGas(
		params: EstimateContractGasParameters
	) : Promise<EstimateContractGasReturnType> {
		const client = createWalletClient({
			account: this.getAccount(),
			chain: this.getChain(),
			transport: http(),
		}).extend(publicActions);

		return await client.estimateContractGas(params);
	}

	async waitForTransactionReceipt(
		params: WaitForTransactionReceiptParameters
	) : Promise<WaitForTransactionReceiptReturnType> {
		return await this.publicClient.waitForTransactionReceipt(params);
	}

	async getGasFees() : Promise<FeeValues> {
		const feeData = await this.publicClient.estimateFeesPerGas();
		return feeData;
	}

	getAccount() : Account {
		const privateKeys = this.configService.get<Hex[]>('onChain.privateKeys') as Hex[];
		const index = Math.floor(Math.random() * privateKeys.length);
		return privateKeyToAccount(privateKeys[index]);
	}

	getEntryPoint() : Hex {
		return this.configService.get<string>('onChain.entryPoint') as Hex;
	}

	getBeneficiary() : Hex {
		return this.configService.get<string>('onChain.beneficiary') as Hex;
	}

	getChain() : Chain {
		const chainName = this.configService.get<string>('onChain.chainName') as keyof typeof chains;
		return chains[chainName];
	}
}
