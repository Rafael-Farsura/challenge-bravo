import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

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

    @Get()
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
