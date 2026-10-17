import 'reflect-metadata';
import { ArgumentMetadata, UnprocessableEntityException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { createValidationPipe, flattenValidationErrors } from './validation.pipe';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';

class AddressDto {
  @IsString()
  city: string;

  @IsInt()
  @Min(1)
  zip: number;
}

class ProfileDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  previous: AddressDto[];
}

const meta: ArgumentMetadata = { type: 'body', metatype: ProfileDto };
const valid = {
  email: 'a@b.io',
  address: { city: 'X', zip: 1 },
  previous: [{ city: 'Y', zip: 2 }],
};

async function failure(body: unknown): Promise<UnprocessableEntityException> {
  try {
    await createValidationPipe().transform(body, meta);
  } catch (e) {
    return e as UnprocessableEntityException;
  }
  throw new Error('expected validation to fail');
}

describe('global validation pipe (#1530)', () => {
  it('accepts a valid body and returns a typed instance', async () => {
    const out = await createValidationPipe().transform(valid, meta);
    expect(out).toBeInstanceOf(ProfileDto);
    expect(out.address).toBeInstanceOf(AddressDto);
  });

  it('answers 422 with field-level details', async () => {
    const err = await failure({ ...valid, email: 'nope' });
    expect(err.getStatus()).toBe(422);
    expect(err.getResponse()).toMatchObject({
      statusCode: 422,
      errors: [{ field: 'email', constraints: ['email must be an email'] }],
    });
  });

  it('rejects unknown properties instead of silently accepting them', async () => {
    const err = await failure({ ...valid, role: 'admin' });
    const { errors } = err.getResponse() as { errors: unknown[] };
    expect(errors).toEqual([
      {
        field: 'role',
        constraints: ['property role should not exist'],
      },
    ]);
  });

  it('validates nested objects and arrays recursively', async () => {
    const err = await failure({
      ...valid,
      address: { city: 5, zip: 0 },
      previous: [{ city: 'ok', zip: 3 }, { city: 'bad' }],
    });
    const { errors } = err.getResponse() as {
      errors: { field: string }[];
    };
    expect(errors.map((e) => e.field).sort()).toEqual([
      'address.city',
      'address.zip',
      'previous[1].zip',
    ]);
  });

  it('flattenValidationErrors handles an empty list', () => {
    expect(flattenValidationErrors([])).toEqual([]);
  });

  it('the global exception filter keeps the field-level errors in the response', async () => {
    const err = await failure({ ...valid, email: 'nope' });
    const json = jest.fn();
    const response = { status: jest.fn().mockReturnValue({ json }) };
    const host: any = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url: '/x' }),
      }),
    };
    new GlobalExceptionFilter().catch(err, host);
    expect(response.status).toHaveBeenCalledWith(422);
    expect(json.mock.calls[0][0]).toMatchObject({
      statusCode: 422,
      path: '/x',
      errors: [{ field: 'email' }],
    });
  });
});
