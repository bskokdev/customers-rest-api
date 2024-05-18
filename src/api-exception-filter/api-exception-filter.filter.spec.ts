import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ApiExceptionFilterFilter } from './api-exception-filter.filter';
import { Request, Response } from 'express';

describe('ApiExceptionFilterFilter', () => {
  let filter: ApiExceptionFilterFilter<unknown>;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiExceptionFilterFilter],
    }).compile();

    filter = module.get<ApiExceptionFilterFilter<unknown>>(ApiExceptionFilterFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should return correct status and message for HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      timestamp: expect.any(String),
      path: mockRequest.url,
      message: 'Forbidden',
    });
  });

  it('should return 500 status and default message for non-HttpException', () => {
    const exception = new Error('Unknown Error');

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: mockRequest.url,
      message: 'Internal Server Error',
    });
  });

  it('getStatus should return correct status for HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    expect(filter.getStatus(exception)).toBe(HttpStatus.FORBIDDEN);
  });

  it('getStatus should return 500 for non-HttpException', () => {
    const exception = new Error('Unknown Error');
    expect(filter.getStatus(exception)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('getMessage should return correct message for HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    expect(filter.getMessage(exception)).toBe('Forbidden');
  });

  it('getMessage should return default message for non-HttpException', () => {
    const exception = new Error('Unknown Error');
    expect(filter.getMessage(exception)).toBe('Internal Server Error');
  });
});
