import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactEntity } from './contact.entity';
import { ContactService } from './services/contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returned AbraajWater contacts.',
  })
  @ApiBearerAuth()
  public async getApplicationContacts(): Promise<ContactEntity> {
    return await this.contactService.getApplicationContacts();
  }
}
