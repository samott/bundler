import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	BadRequestException,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { Logger } from '@nestjs/common';

const JsonRpcErrors = {
	InvalidRequest: -32600,
	ParseError: -32700,
	InternalError: -32603,
} as const;

@Catch(HttpException)
export class JsonRpcExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(JsonRpcExceptionFilter.name);

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		this.logger.warn(exception);

		const code = (exception instanceof BadRequestException)
			? JsonRpcErrors.InvalidRequest
			: JsonRpcErrors.InternalError

		const error = (exception instanceof BadRequestException)
			? 'Invalid request'
			: 'Internal error';

		response
			.status(status)
			.json({
				jsonrpc: "2.0",
				...( request?.body?.id ? { id: request.body.id } : null ),
				error: {
					code,
					error,
					details: JSON.stringify(
						exception.getResponse()
							?? 'Unknown error',
					(_, v) => typeof v === 'bigint' ? v.toString() : v)
				}
			});
	}
}

