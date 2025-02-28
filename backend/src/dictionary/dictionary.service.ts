import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DictionaryWord } from './entities/dictionary-word.entity';
import { PendingWord } from './entities/pending-word.entity';
import { SubmitWordDto } from './dto/submit-word.dto';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(DictionaryWord)
    private dictionaryWordRepo: Repository<DictionaryWord>,
    @InjectRepository(PendingWord)
    private pendingWordRepo: Repository<PendingWord>,
    @Inject(CACHE_MANAGER)
    private cacheManager: any,
  ) {}

  async getRandomWord(): Promise<DictionaryWord> {
    // Try cache first
    const cachedWord = await this.cacheManager.get('random_word');
    if (cachedWord) {
      return cachedWord as DictionaryWord;
    }

    // Get from DB if not in cache
    const word = await this.dictionaryWordRepo
      .createQueryBuilder('word')
      .where('word.isActive = :isActive', { isActive: true })
      .orderBy('RANDOM()')
      .getOne();

    if (!word) {
      throw new NotFoundException('No words available');
    }

    // Cache the word
    await this.cacheManager.set('random_word', word, 3600);
    return word;
  }

  async submitWord(dto: SubmitWordDto, user: User): Promise<PendingWord> {
    // Check if word already exists in dictionary
    const existingWord = await this.dictionaryWordRepo.findOne({
      where: { word: dto.word.toLowerCase() },
    });

    if (existingWord) {
      throw new ConflictException('Word already exists in dictionary');
    }

    // Check if word is already pending
    const pendingWord = await this.pendingWordRepo.findOne({
      where: { word: dto.word.toLowerCase(), status: 'pending' },
    });

    if (pendingWord) {
      throw new ConflictException('Word is already pending approval');
    }

    // Create new pending word
    const newPendingWord = this.pendingWordRepo.create({
      word: dto.word.toLowerCase(),
      definition: dto.definition,
      submittedBy: user,
    });

    return this.pendingWordRepo.save(newPendingWord);
  }

  async fetchWordsFromExternalAPI(): Promise<void> {
    try {
      // Example using Free Dictionary API
      const response = await axios.get(
        'https://api.dictionaryapi.dev/api/v2/entries/en/random',
      );
      const wordData = response.data[0];

      const newWord = this.dictionaryWordRepo.create({
        word: wordData.word.toLowerCase(),
        definition: wordData.meanings[0]?.definitions[0]?.definition,
        source: 'external_api',
      });

      await this.dictionaryWordRepo.save(newWord);
      // Clear cache after adding new word
      await this.cacheManager.del('random_word');
    } catch (error) {
      console.error('Error fetching words from external API:', error);
    }
  }

  async validateWord(word: string): Promise<boolean> {
    const normalizedWord = word.toLowerCase();
    const cachedResult = await this.cacheManager.get(
      `word_valid_${normalizedWord}`,
    );

    if (cachedResult !== undefined) {
      return cachedResult as boolean;
    }

    const existingWord = await this.dictionaryWordRepo.findOne({
      where: { word: normalizedWord, isActive: true },
    });

    const isValid = !!existingWord;
    await this.cacheManager.set(`word_valid_${normalizedWord}`, isValid, 3600);

    return isValid;
  }
}
