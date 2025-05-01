import { PartialType } from '@nestjs/mapped-types';
import { CreateGameResultDto } from './create-game-result.dto';

export class UpdateGameResultDto extends PartialType(CreateGameResultDto) {}
