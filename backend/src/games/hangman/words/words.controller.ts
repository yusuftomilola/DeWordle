import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { WordsService } from "./words.service"
import type { CreateWordDto } from "./dto/create-word.dto"
import type { UpdateWordDto } from "./dto/update-word.dto"
import { JwtAuthGuard } from "security/guards/jwt-auth.guard"
import { Throttle } from "@nestjs/throttler"
import { RolesGuard } from "security/guards/rolesGuard/roles.guard"
import { Roles } from "src/games/lettered-box/auth/decorators/roles.decorator"

@ApiTags("words")
@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  @ApiOperation({ summary: "Get all words" })
  @ApiResponse({ status: 200, description: "Return all words." })
  findAll() {
    return this.wordsService.findAll()
  }

  @Get('random')
  @ApiOperation({ summary: 'Get a random word' })
  @ApiResponse({ status: 200, description: 'Return a random word.' })
//  @Throttle({ limit: 5, ttl: 60 }) // ✅ Limit to 5 requests per 60 seconds
  getRandomWord(@Query('category') category?: string) {
    return this.wordsService.getRandomWord(category);
  }

  @Get("random/:difficulty")
  @ApiOperation({ summary: "Get a random word by difficulty" })
  @ApiResponse({ status: 200, description: "Return a random word of specified difficulty." })
//  @Throttle({ limit: 5, ttl: 60 }) // Limit to 5 requests per minute
  getRandomWordByDifficulty(@Param('difficulty') difficulty: string, @Query('category') category?: string) {
    return this.wordsService.getRandomWordByDifficulty(Number(difficulty), category)
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all available categories" })
  @ApiResponse({ status: 200, description: "Return all categories." })
  getCategories() {
    return this.wordsService.getCategories()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word by id' })
  @ApiResponse({ status: 200, description: 'Return a word by id.' })
  findOne(@Param('id') id: string) {
    return this.wordsService.findOne(+id);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/words')
  @ApiOperation({ summary: 'Create a new word (Admin)' })
  @ApiResponse({ status: 201, description: 'The word has been successfully created.' })
  @ApiBearerAuth()
  createWord(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/words/batch')
  @ApiOperation({ summary: 'Create multiple words (Admin)' })
  @ApiResponse({ status: 201, description: 'The words have been successfully created.' })
  @ApiBearerAuth()
  createWords(@Body() createWordsDto: CreateWordDto[]) {
    return this.wordsService.createBatch(createWordsDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch("admin/words/:id")
  @ApiOperation({ summary: "Update a word (Admin)" })
  @ApiResponse({ status: 200, description: "The word has been successfully updated." })
  @ApiBearerAuth()
  updateWord(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto) {
    return this.wordsService.update(+id, updateWordDto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/words/:id')
  @ApiOperation({ summary: 'Delete a word (Admin)' })
  @ApiResponse({ status: 200, description: 'The word has been successfully deleted.' })
  @ApiBearerAuth()
  removeWord(@Param('id') id: string) {
    return this.wordsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("admin/words/export")
  @ApiOperation({ summary: "Export all words (Admin)" })
  @ApiResponse({ status: 200, description: "Return all words in CSV format." })
  @ApiBearerAuth()
  exportWords() {
    return this.wordsService.exportWords()
  }
}
