import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { BadRequestException } from '@nestjs/common';

@Controller('currency')
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}

    @Get('convert')
    async convert(@Query() query: ConvertCurrencyDto) {
        try {
            const result = await this.currencyService.convert(query);

            return result;
        } catch (error) {
            console.error(error);
            throw new BadRequestException('Error converting currency');
        }
    }

    @Post('add')
    async create(@Body() body: CreateCurrencyDto) {
        try {
            await this.currencyService.create(body);
            return { message: `${body.currency} added successfully` };
        } catch (error) {
            console.error(error);
            throw new BadRequestException(`Error adding currency`);
        }
    }

    findAll() {
        return this.currencyService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.currencyService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() convertCurrencyDto: ConvertCurrencyDto,
    ) {
        return this.currencyService.update(+id, convertCurrencyDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.currencyService.remove(+id);
    }
}
