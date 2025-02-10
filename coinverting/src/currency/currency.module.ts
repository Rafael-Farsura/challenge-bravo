import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
