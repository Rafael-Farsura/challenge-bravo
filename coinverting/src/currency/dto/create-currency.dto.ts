import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCurrencyDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  exchangeRateToUSD: number;

  @IsBoolean()
  @IsNotEmpty()
  isFictional: boolean;
}
