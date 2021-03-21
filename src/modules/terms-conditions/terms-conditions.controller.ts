import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTermsConditionsDto } from './dto/create-terms-conditions.dto';
import { TermsConditionsService } from './services/terms-conditions.service';
import { TermsConditionsEntity } from './terms-conditions.entity';

@ApiTags('terms-conditions')
@Controller('terms-conditions')
export class TermsConditionsController {
  constructor(private readonly termsConditionsService: TermsConditionsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returned AbraajWater terms and conditions.',
  })
  @ApiBearerAuth()
  public async getApplicationTermsConditions(): Promise<TermsConditionsEntity> {
    return await this.termsConditionsService.getApplicationTermsConditions();
  }

  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'update terms and conditions',
  })
  @ApiBody({ type: CreateTermsConditionsDto })
  public async createQuestion(
    @Body(new ValidationPipe()) termsConditionsDto: CreateTermsConditionsDto,
  ): Promise<TermsConditionsEntity> {
    return await this.termsConditionsService.createTermsConditions(termsConditionsDto);
  }
}
