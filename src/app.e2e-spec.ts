import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { createUserOp } from './test/utils';

describe('App', () => {
	let app: INestApplication;
	let configService: ConfigService;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				transform: true,
			})
		);

		await app.init();

		configService = module.get<ConfigService>(ConfigService);
	});

	it('Should successfully post a user op', async () => {
		const userOp = await createUserOp(configService);

		const res = await request(app.getHttpServer())
			.post('/rpc')
			.send({
				jsonrpc: '2.0',
				id: 42,
				method: 'eth_sendUserOperation',
				params: [
					userOp
				]
			});

		expect(res.body).toMatchObject(expect.objectContaining({
			jsonrpc: '2.0',
			method: 'eth_sendUserOperation',
			id: 42,
			result: expect.objectContaining({
				status: 'submitted',
				txHash: expect.stringMatching(/^0x[a-fA-F0-9]{1,}/)
			})
		}));
	});

	it('Should fail due to invalid parameters', async () => {
		const userOp = { sender: "z" };

		const res = await request(app.getHttpServer())
			.post('/rpc')
			.send({
				jsonrpc: '2.0',
				id: 42,
				method: 'eth_sendUserOperation',
				params: [
					userOp
				]
			});

		expect(res.body).toMatchObject(expect.objectContaining({
			id: 42,
			jsonrpc: '2.0',
			error: expect.objectContaining({
				code: -32600
			})
		}));
	});

	afterAll(async () => {
		await app.close();
	});
});
