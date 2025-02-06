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

    private async getValueInUSD(currencyCode: string): Promise<number> {
        await this.validateCurrency(currencyCode);

        if (currencyCode === 'USD') return 1;

        let currency = await this.currencyRepository.findOne({
            where: { code: currencyCode },
        });

        if (!currency) {
            const realCurrencyInUSD =
                await this.fetchExchangeRate(currencyCode);

            if (!realCurrencyInUSD)
                throw new BadRequestException(
                    `'Currency : ${currencyCode} not found'`,
                );

            currency = this.currencyRepository.create({
                code: currencyCode,
                exchangeRateToUSD: realCurrencyInUSD,
                isFictional: false,
            });

            await this.currencyRepository.save(currency);
        }

        return currency.exchangeRateToUSD;
    }

    private async isCurrencySupported(currencyCode: string): Promise<boolean> {
        return (await this.currencyRepository.findOneOrFail({
            where: { code: currencyCode },
        }))
            ? true
            : false;
    }

    private async validateCurrency(currencyCode: string): Promise<boolean> {
        if (await this.isCurrencySupported(currencyCode)) return true;

        throw new BadRequestException(
            `The currency ${currencyCode} is not valid`,
        );
    }

    async convert(convertCurrencyDto: ConvertCurrencyDto) {
        const { from, to, amount } = convertCurrencyDto;

        const [currencyFromInUSD, currencyToInUSD] = await Promise.all([
            this.getValueInUSD(from),
            this.getValueInUSD(to),
        ]);

        const convertedAmount = (currencyFromInUSD / currencyToInUSD) * amount;

        return {
            from,
            to,
            amount,
            convertedAmount: convertedAmount,
            exchangeRate: currencyFromInUSD / currencyToInUSD,
        };
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
