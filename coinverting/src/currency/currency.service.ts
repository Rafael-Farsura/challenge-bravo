import {
    ConflictException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';

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

        let currency: Currency | null =
            await this.findOneCurrency(currencyCode);

        if (!currency) {
            const realCurrencyInUSD =
                await this.fetchExchangeRate(currencyCode);

            if (!realCurrencyInUSD)
                throw new NotFoundException(
                    `Currency : ${currencyCode} not found`,
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

    private async isCurrencySupported(
        currencyCode: string,
        isAddMethod?: boolean,
    ): Promise<boolean> {
        console.error(currencyCode);

        return Promise.resolve(
            (await this.findOneCurrency(currencyCode, isAddMethod))
                ? true
                : false,
        );
    }

    private async validateCurrency(currencyCode: string): Promise<boolean> {
        if (await this.isCurrencySupported(currencyCode)) return true;

        throw new NotAcceptableException(
            `The currency ${currencyCode} is not valid`,
        );
    }

    private async isFictionalCurrency(currencyCode: string): Promise<boolean> {
        const currencyInUSD = await this.fetchExchangeRate(currencyCode);

        if (!currencyInUSD) return true;

        return false;
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

    async create(addCurrencyDto: CreateCurrencyDto): Promise<string> {
        const currency = addCurrencyDto.currency;
        let isFictional = addCurrencyDto.isFictional;
        let exchangeRateToUSD = addCurrencyDto.exchangeRateToUSD;

        if (await this.isCurrencySupported(currency, true))
            throw new ConflictException('Currency already supported');

        console.error('DPS DO 1 IF');
        isFictional = await this.isFictionalCurrency(currency);

        if (!isFictional)
            exchangeRateToUSD = await this.fetchExchangeRate(currency);

        const currencyEntity: Currency = this.currencyRepository.create({
            code: currency,
            exchangeRateToUSD: exchangeRateToUSD,
            isFictional: isFictional,
        });

        await this.currencyRepository.save(currencyEntity);

        return `${currency} was added successfully`;
    }

    async remove(currencyCode: string): Promise<string> {
        await this.validateCurrency(currencyCode);
        await this.currencyRepository.delete({ code: currencyCode });

        return `${currencyCode} deleted successfully`;
    }

    async findAllCurrencies() {
        const currencies = await this.currencyRepository.find();

        if (!currencies) throw new NotFoundException('No currencies found');

        return currencies;
    }

    async findOneCurrency(
        currencyCode: string,
        isAddMethod?: boolean,
    ): Promise<Currency | null> {
        const currency = await this.currencyRepository.findOne({
            where: { code: currencyCode },
        });

        console.error(`find one :: ${currency?.code}`);

        if (!currency && !isAddMethod)
            throw new NotFoundException(
                `Could not find currency : ${currencyCode}`,
            );

        return currency;
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
