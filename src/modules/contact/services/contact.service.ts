import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactEntity } from '../contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactEntityRepository: Repository<ContactEntity>,
  ) {}

  public async getApplicationContacts(): Promise<ContactEntity> {
    return Array.from(await this.contactEntityRepository.find()).shift();
  }
}
