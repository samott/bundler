import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

const JsonRpcErrors = {
	ParseError: -32700,
	InternalError: -32603,
} as const;

@Catch(HttpException)
export class JsonRpcExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		response
			.status(status)
			.json({
				jsonrpc: "2.0",
				error: {
					code: JsonRpcErrors.InternalError,
					message: "Error"
				}
			});
	}
}

