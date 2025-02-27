export class WordResponseDto {
  id: number;
  word: string;
  definition?: string;
  isActive: boolean;
  source: string;
  createdAt: Date;
}
