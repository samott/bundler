import { shuffle } from 'fast-shuffle'

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
	constructor(
		private readonly configService: ConfigService
	) {}

	async readContract(
		params: ReadContractParameters
	) : Promise<ReadContractReturnType> {
		const client = createPublicClient({
			chain: this.getChain(),
			transport: http(),
		});

		return await client.readContract(params);
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
		const client = createPublicClient({
			chain: this.getChain(),
			transport: http(),
		});

		return await client.waitForTransactionReceipt(params);
	}

	async getGasFees() : Promise<FeeValues> {
		const client = createPublicClient({
			chain: this.getChain(),
			transport: http(),
		});

		const feeData = await client.estimateFeesPerGas();
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
