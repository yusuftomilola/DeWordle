import { PartialType } from '@nestjs/mapped-types';
import { CreateSubAdminDto } from './create-sub-admin.dto';

export class UpdateSubAdminDto extends PartialType(CreateSubAdminDto) {}
