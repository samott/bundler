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

import {
	ReadContractParameters,
	ReadContractReturnType,
	WriteContractParameters,
	WriteContractReturnType,
	WaitForTransactionReceiptParameters,
	WaitForTransactionReceiptReturnType,
	Chain,
	Abi,
	ContractFunctionName,
	ContractFunctionArgs,
} from 'viem';

type IViemClient = {
	readContract<
		chain extends Chain | undefined,
		const abi extends Abi | readonly unknown[],
		functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
		const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
	>(
		parameters: ReadContractParameters<abi, functionName, args>,
	) : Promise<ReadContractReturnType<abi, functionName, args>>;

	writeContract<
		chain extends Chain | undefined,
		account extends Account | undefined,
		const abi extends Abi | readonly unknown[],
		functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
		args extends ContractFunctionArgs<
			abi,
			'nonpayable' | 'payable',
			functionName
		>,
		chainOverride extends Chain | undefined,
	>(
		parameters: WriteContractParameters<
			abi,
			functionName,
			args,
			chain,
			account,
			chainOverride
		>,
	) : Promise<WriteContractReturnType>;

	waitForTransactionReceipt<
		TChain extends Chain | undefined,
	>(
		params: WaitForTransactionReceiptParameters<TChain>
	) : Promise<WaitForTransactionReceiptReturnType<TChain>>

	chain: Chain;
};

@Injectable()
export class BlockchainService {
	constructor(
		readonly client: IViemClient,
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
