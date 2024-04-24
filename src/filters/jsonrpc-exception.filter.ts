import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

import { Logger } from '@nestjs/common';

const JsonRpcErrors = {
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

		response
			.status(status)
			.json({
				jsonrpc: "2.0",
				error: {
					code: JsonRpcErrors.InternalError,
					error: "Error",
					details: JSON.stringify(
						exception.getResponse()
							?? 'Unknown error'
					)
				}
			});
	}
}

