import { BadRequestException, Injectable } from '@nestjs/common';

import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { Repository } from 'typeorm';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

interface ExchangeRateResponse {
    [key: string]: {
        ask: number;
    };
}
@Injectable()
export class CurrencyService {
    private readonly baseApiUrl =
        'https://economia.awesomeapi.com.br/json/last';

    private readonly supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];

    constructor(
        @InjectRepository(Currency)
        private currencyRepository: Repository<Currency>,
    ) {}

    async onModuleInit() {
        await this.initializeSupportedCurrencies();
    }

    private async fetchExchangeRate(currencyCode: string): Promise<number> {
        if (currencyCode === 'USD') return 1;

        try {
            const response = await axios.get<ExchangeRateResponse>(
                `${this.baseApiUrl}/${currencyCode}-USD`,
            );

            return response.data[`${currencyCode}USD`]?.ask;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }

    update(id: number, convertCurrencyDto: ConvertCurrencyDto) {
        return `This action updates a #${id} currency`;
    }

    remove(id: number) {
        return `This action removes a #${id} currency`;
    }

    async initializeSupportedCurrencies() {
        for (const currency of this.supportedCurrencies) {
            const existingCurrency = await this.currencyRepository.findOne({
                where: { code: currency },
            });

            if (!existingCurrency) {
                const currencyInUSD = await this.fetchExchangeRate(currency);

                if (currencyInUSD) {
                    const currencyEntity = this.currencyRepository.create({
                        code: currency,
                        exchangeRateToUSD: currencyInUSD,
                        isFictional: false,
                    });

                    await this.currencyRepository.save(currencyEntity);
                }
            }
        }
    }
}
