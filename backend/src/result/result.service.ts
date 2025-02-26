import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { statusResult } from './entities/result.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateStatusResultDto } from './dto/status-result.dto';
import { Response as Res } from 'express';

@Injectable()
export class ResultService {
  create(_createResultDto: CreateResultDto) {
    return 'This action adds a new result';
  }

  findAll() {
    return `This action returns all result`;
  }

  findOne(id: number) {
    return `This action returns a #${id} result`;
  }

  update(id: number, _updateResultDto: UpdateResultDto) {
    return `This action updates a #${id} result`;
  }

  remove(id: number) {
    return `This action removes a #${id} result`;
  }

  constructor(
    @InjectRepository(statusResult)
    private readonly resultRepository: Repository<statusResult>,
  ) {}

  async createResult(userId: string): Promise<statusResult> {
    try {
      const existingResult = await this.resultRepository.findOne({
        where: { userId },
      });
      if (existingResult) {
        throw new Error('Result already exists for this user.');
      }

      const newResult = this.resultRepository.create({
        userId,
        timesPlayed: 0,
        currentStreak: 0,
        maxStreak: 0,
        winPercentage: 0.0,
      });

      return await this.resultRepository.save(newResult);
    } catch (error) {
      throw new Error(`Error creating result: ${error.message}`);
    }
  }

  async findAllResults(res: Res): Promise<void> {
    try {
      const results = await this.resultRepository.find();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async findOneResults(userId: string, res: Res): Promise<void> {
    try {
      const result = await this.resultRepository.findOne({ where: { userId } });
      if (!result) {
        res
          .status(404)
          .json({ message: `Result not found for userId: ${userId}` });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateResults(
    userId: string,
    updateResultDto: UpdateStatusResultDto,
    res: Res,
  ): Promise<void> {
    try {
      const result = await this.resultRepository.findOne({ where: { userId } });
      if (!result) {
        res
          .status(404)
          .json({ message: `Result not found for userId: ${userId}` });
        return;
      }
      Object.assign(result, updateResultDto);
      const updatedResult = await this.resultRepository.save(result);
      res.status(200).json(updatedResult);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async removeResults(userId: string, res: Res): Promise<void> {
    try {
      const result = await this.resultRepository.findOne({ where: { userId } });
      if (!result) {
        res
          .status(404)
          .json({ message: `Result not found for userId: ${userId}` });
        return;
      }
      await this.resultRepository.remove(result);
      res.status(200).json({ message: 'Result removed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
