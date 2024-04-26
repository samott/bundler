import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

import * as Joi from 'joi';

const ConfigSchema = Joi.object({
	app: Joi.object({
		port: Joi.number().required(),
	}).required(),
	onChain: Joi.object({
		entryPoint: Joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required(),
		privateKeys: Joi.array().min(1).items(Joi.string().regex(/^0x[a-fA-F0-9]{64}$/).required()),
		beneficiary: Joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required(),
	}).required(),
	test: Joi.object({
		endUser: Joi.object({
			privateKey: Joi.string().regex(/^0x[a-fA-F0-9]{64}$/).required(),
		})
	})
});

export default () => {
	const config = yaml.load(
		readFileSync(join(__dirname, `${process.env.CONFIG ?? 'default'}.yaml`), 'utf8'),
	) as Record<string, any>;

	Joi.assert(config, ConfigSchema);

	return config;
};
