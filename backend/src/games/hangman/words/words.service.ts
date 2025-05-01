import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Word } from "./entities/word.entity"
import type { CreateWordDto } from "./dto/create-word.dto"
import type { UpdateWordDto } from "./dto/update-word.dto"

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private wordsRepository: Repository<Word>,
  ) {}

  async create(createWordDto: CreateWordDto): Promise<Word> {
    const word = new Word()
    Object.assign(word, {
      ...createWordDto,
      word: createWordDto.word.toUpperCase(),
    })

    // Calculate difficulty if not provided
    if (!createWordDto.difficulty) {
      word.difficulty = this.calculateWordDifficulty(word.word)
    }

    return this.wordsRepository.save(word)
  }

  async createBatch(createWordDtos: CreateWordDto[]): Promise<Word[]> {
    const words = createWordDtos.map((dto) => {
      const word = new Word()
      Object.assign(word, {
        ...dto,
        word: dto.word.toUpperCase(),
        difficulty: dto.difficulty || this.calculateWordDifficulty(dto.word),
      })
      return word
    })

    return this.wordsRepository.save(words)
  }

  async findAll(): Promise<Word[]> {
    return this.wordsRepository.find()
  }

  async findOne(id: number): Promise<Word> {
    const word = await this.wordsRepository.findOne({ where: { id } })
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`)
    }
    return word
  }

  async update(id: number, updateWordDto: UpdateWordDto): Promise<Word> {
    const word = await this.findOne(id)

    // Update fields
    Object.assign(word, {
      ...updateWordDto,
      word: updateWordDto.word ? updateWordDto.word.toUpperCase() : word.word,
    })

    // Recalculate difficulty if word changed and difficulty not provided
    if (updateWordDto.word && !updateWordDto.difficulty) {
      word.difficulty = this.calculateWordDifficulty(word.word)
    }

    return this.wordsRepository.save(word)
  }

  async remove(id: number): Promise<void> {
    const result = await this.wordsRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Word with ID ${id} not found`)
    }
  }

  async getRandomWord(category?: string): Promise<Word> {
    const queryBuilder = this.wordsRepository.createQueryBuilder("word")

    if (category) {
      queryBuilder.where("word.category = :category", { category })
    }

    queryBuilder.orderBy("RANDOM()")
    queryBuilder.limit(1)

    const word = await queryBuilder.getOne()

    if (!word) {
      throw new NotFoundException("No words found")
    }

    // Increment usage count
    word.usageCount += 1
    await this.wordsRepository.save(word)

    return word
  }

  async getRandomWordByDifficulty(difficulty: number, category?: string): Promise<Word> {
    const queryBuilder = this.wordsRepository.createQueryBuilder("word")

    queryBuilder.where("word.difficulty = :difficulty", { difficulty })

    if (category) {
      queryBuilder.andWhere("word.category = :category", { category })
    }

    queryBuilder.orderBy("RANDOM()")
    queryBuilder.limit(1)

    const word = await queryBuilder.getOne()

    if (!word) {
      throw new NotFoundException("No words found with the specified criteria")
    }

    // Increment usage count
    word.usageCount += 1
    await this.wordsRepository.save(word)

    return word
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await this.wordsRepository
      .createQueryBuilder("word")
      .select("word.category", "category")
      .addSelect("COUNT(word.id)", "count")
      .groupBy("word.category")
      .getRawMany()

    return categories
  }

  async exportWords(): Promise<Word[]> {
    return this.wordsRepository.find()
  }

  private calculateWordDifficulty(word: string): number {
    // Factors that affect difficulty:
    // 1. Word length
    const lengthFactor = Math.min(word.length / 10, 1) * 0.4

    // 2. Uncommon letters (J, Q, X, Z)
    const uncommonLetters = (word.match(/[jqxz]/gi) || []).length
    const uncommonFactor = Math.min(uncommonLetters / 2, 1) * 0.3

    // 3. Repeated letters (easier)
    const uniqueLetters = new Set(word.toLowerCase()).size
    const repetitionFactor = (1 - uniqueLetters / word.length) * 0.3

    // Calculate final difficulty (0-3)
    const rawDifficulty = (lengthFactor + uncommonFactor + repetitionFactor) * 3

    // Round to nearest integer (1-3)
    return Math.max(1, Math.min(3, Math.round(rawDifficulty)))
  }
}
