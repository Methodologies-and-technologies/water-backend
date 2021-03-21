import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactEntity } from './contact.entity';
import { ContactService } from './services/contact.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
