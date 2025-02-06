import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@Controller('currency')
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}

    @Get('convert')
    async convert(@Query() query: ConvertCurrencyDto) {
        const result = await this.currencyService.convert(query);

        return result;
    }

    @Post('add')
    async create(@Body() body: CreateCurrencyDto) {
        await this.currencyService.create(body);

        return { message: `${body.currency} added successfully` };
    }

    @Get('')
    findAll() {
        return this.currencyService.findAllCurrencies();
    }

    @Get('find')
    findOne(@Body() body: { currency: string }) {
        return this.currencyService.findOneCurrency(body.currency);
    }

    @Delete('delete')
    async remove(@Body() body: { currency: string }) {
        await this.currencyService.remove(body.currency);

        return `The currency ${body.currency} has been deleted`;
    }
}
