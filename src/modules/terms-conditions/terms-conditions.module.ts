import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { TermsConditionsService } from './services/terms-conditions.service';
import { TermsConditionsController } from './terms-conditions.controller';
import { TermsConditionsEntity } from './terms-conditions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TermsConditionsEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TermsConditionsController],
  providers: [TermsConditionsService],
  exports: [TermsConditionsService],
})
export class TermsConditionsModule {}
