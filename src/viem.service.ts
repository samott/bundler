import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

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
	WalletClient,
	FeeValues,
	ReadContractParameters,
	ReadContractReturnType,
	WriteContractParameters,
	WriteContractReturnType,
	WaitForTransactionReceiptParameters,
	WaitForTransactionReceiptReturnType,
	EstimateContractGasParameters,
	EstimateContractGasReturnType,
	hexToBytes,
} from 'viem';

import { HDKey, hdKeyToAccount } from 'viem/accounts';

import * as chains from 'viem/chains';

type BundlerAccount = {
	account: Account,
	client: WalletClient,
	balance: bigint,
	lastBalanceCheck: Date|null,
};

@Injectable()
export class ViemService implements OnApplicationBootstrap {
	private readonly logger = new Logger(ViemService.name);

	private publicClient: PublicClient;
	private accounts: BundlerAccount[] = [];

	async onApplicationBootstrap(): Promise<void> {
		this.refreshBalances();
	}

	constructor(
		private readonly configService: ConfigService
	) {
		this.publicClient = createPublicClient({
			chain: this.getChain(),
			transport: http(),
		});

		this.loadAccounts();
	}

	loadAccounts() {
		const seed = this.configService.get<Hex>('onChain.hdKey.seed') as Hex;
		const maxAccounts = this.configService.get<number>('onChain.maxAccounts') ?? 0;
		const chain = this.getChain();

		const hdKey = HDKey.fromMasterSeed(hexToBytes(seed));

		this.logger.log(`Loading ${maxAccounts} HD EOA accounts...`);

		for (let i = 0; i < maxAccounts; i++) {
			const account = hdKeyToAccount(hdKey, { accountIndex: i });

			const client = createWalletClient({
				account,
				chain,
				transport: http(),
			}).extend(publicActions);

			this.accounts.push({
				account,
				client,
				balance: 0n,
				lastBalanceCheck: new Date()
			});
		}
	}

	async refreshBalances() {
		for (let i = 0; i < this.accounts.length; i++) {
			const address = this.accounts[i].account.address;

			const balance = await this.publicClient.getBalance({
				address
			});

			this.logger.log(`Account ${address} has ${balance} wei.`);

			this.accounts[i].balance = balance;
			this.accounts[i].lastBalanceCheck = new Date();
		}

		this.accounts.sort((b: BundlerAccount, a: BundlerAccount) => Number(b.balance - a.balance));
	}

	async readContract(
		params: ReadContractParameters
	) : Promise<ReadContractReturnType> {
		return await this.publicClient.readContract(params);
	}

	async writeContract(
		params: WriteContractParameters
	) : Promise<WriteContractReturnType> {
		const account = this.getBundlerAccount();
		return await account.client.writeContract(params);
	}

	async estimateContractGas(
		params: EstimateContractGasParameters
	) : Promise<EstimateContractGasReturnType> {
		const account = this.getBundlerAccount();
		return await this.publicClient.estimateContractGas(params);
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
		return this.getBundlerAccount().account;
	}

	getBundlerAccount() : BundlerAccount {
		// Take the account with the most Ether
		return this.accounts[0];
	}

	getBeneficiary() : Account {
		// Take the account with the least Ether
		const lastIndex = this.accounts.length - 1;
		return this.accounts[lastIndex].account;
	}

	getEntryPoint() : Hex {
		return this.configService.get<string>('onChain.entryPoint') as Hex;
	}

	getChain() : Chain {
		const chainName = this.configService.get<string>('onChain.chainName') as keyof typeof chains;
		return chains[chainName];
	}
}
