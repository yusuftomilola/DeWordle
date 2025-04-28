import { Controller, Get } from '@nestjs/common';
import { SpellingBeeService } from './spelling-bee.service';

@Controller('spelling-bee')
export class SpellingBeeController {
  constructor(private readonly spellingBeeService: SpellingBeeService) {}
}
