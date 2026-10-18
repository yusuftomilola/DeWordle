import { BadRequestException, HttpStatus, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

function run(exception: unknown) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host: any = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/boom' }),
    }),
  };
  new GlobalExceptionFilter().catch(exception, host);
  return { status: status.mock.calls[0][0], body: json.mock.calls[0][0] };
}

describe('GlobalExceptionFilter response sanitization (#1536)', () => {
  const original = process.env.NODE_ENV;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    process.env.NODE_ENV = original;
    logSpy.mockRestore();
  });

  const leaky = () => {
    const e = new Error('duplicate key value violates unique constraint "UQ_users_email"');
    e.stack = 'Error: ...\n    at /srv/app/dist/user/user.service.js:42:11';
    return e;
  };

  it('hides internal error messages and stack traces in production', () => {
    process.env.NODE_ENV = 'production';
    const { status, body } = run(leaky());
    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toMatch(/UQ_users_email|user\.service|stack/i);
    expect(Object.keys(body).sort()).toEqual(['error', 'message', 'path', 'statusCode', 'timestamp']);
  });

  it('still logs the stack server-side', () => {
    process.env.NODE_ENV = 'production';
    run(leaky());
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('UQ_users_email'), expect.stringContaining('user.service.js'));
  });

  it('shows the underlying message outside production, but never a stack', () => {
    process.env.NODE_ENV = 'development';
    const { body } = run(leaky());
    expect(body.message).toContain('UQ_users_email');
    expect(JSON.stringify(body)).not.toContain('user.service.js');
  });

  it('client errors keep their message in every environment', () => {
    process.env.NODE_ENV = 'production';
    const { status, body } = run(new BadRequestException('email must be an email'));
    expect(status).toBe(400);
    expect(body.message).toBe('email must be an email');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
