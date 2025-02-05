import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@Injectable()
export class CurrencyService {
    create(createCurrencyDto: CreateCurrencyDto) {
        return 'This action adds a new currency';
    }

    findAll() {
        return `This action returns all currency`;
    }

    findOne(id: number) {
        return `This action returns a #${id} currency`;
    }

    update(id: number, convertCurrencyDto: ConvertCurrencyDto) {
        return `This action updates a #${id} currency`;
    }

    remove(id: number) {
        return `This action removes a #${id} currency`;
    }
}
