import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { Currency } from './entities/currency.entity';
import { ConflictException, NotAcceptableException } from '@nestjs/common';

describe('CurrencyController', () => {
  let controller: CurrencyController;
  let mockCurrencyService: Partial<CurrencyService>;

  beforeEach(async () => {
    mockCurrencyService = {
      convert: jest.fn().mockResolvedValue({ convertedAmount: 85 }),
      create: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),

      findAllCurrencies: jest.fn().mockResolvedValue(['USD', 'EUR', 'BRL']),

      findOneCurrency: jest.fn().mockResolvedValue({
        id: 1,
        code: 'USD',
        exchangeRateToUSD: 1,
        isFictional: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convert', () => {
    it('should successfully convert currency', async () => {
      const mockQuery = {
        from: 'USD',
        to: 'EUR',
        amount: 100,
      };
      const mockResult = { convertedAmount: 85 };

      (mockCurrencyService.convert as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.convert(mockQuery);

      expect(mockCurrencyService.convert).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });

    it('should handle conversion error', async () => {
      const mockQuery = {
        from: 'USD',
        to: 'EUR',
        amount: 100,
      };

      (mockCurrencyService.convert as jest.Mock).mockRejectedValue(
        new NotAcceptableException('Could not accept this conversion'),
      );

      await expect(controller.convert(mockQuery)).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });

  describe('create', () => {
    it('should successfully add a currency', async () => {
      const mockBody = {
        currency: 'BRL',
        exchangeRateToUSD: 5.5,
        isFictional: false,
      };

      (mockCurrencyService.create as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.create(mockBody);

      expect(mockCurrencyService.create).toHaveBeenCalledWith(mockBody);
      expect(result).toEqual({ message: 'BRL added successfully' });
    });

    it('should handle add currency error', async () => {
      const mockBody = {
        currency: 'BRL',
        exchangeRateToUSD: 5.5,
        isFictional: false,
      };

      (mockCurrencyService.create as jest.Mock).mockRejectedValue(
        new ConflictException('Currency already exists'),
      );

      await expect(controller.create(mockBody)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeCurrency', () => {
    it('should successfully remove a currency', async () => {
      const mockBody = { currency: 'BRL' };

      (mockCurrencyService.remove as jest.Mock).mockResolvedValue(
        'BRL deleted successfully',
      );

      const result = await controller.remove(mockBody);

      expect(mockCurrencyService.remove).toHaveBeenCalledWith('BRL');
      expect(result).toEqual('The currency BRL has been deleted');
    });
  });

  describe('findAllCurrencies', () => {
    it('should return supported currencies', async () => {
      const mockCurrencies = ['USD', 'EUR', 'BRL'];

      (mockCurrencyService.findAllCurrencies as jest.Mock).mockResolvedValue(
        mockCurrencies,
      );

      const result = await controller.findAll();

      expect(result).toEqual(mockCurrencies);
      expect(mockCurrencyService.findAllCurrencies).toHaveBeenCalled();
    });
  });

  describe('findOneCurrency', () => {
    it('should return supported currency', async () => {
      const mockCurrency: Currency = {
        id: 1,
        code: 'USD',
        exchangeRateToUSD: 1,
        isFictional: false,
      };

      (mockCurrencyService.findOneCurrency as jest.Mock).mockResolvedValue(
        mockCurrency,
      );

      const result = await controller.findOne('USD');

      expect(result).toEqual(mockCurrency);
      expect(mockCurrencyService.findOneCurrency).toHaveBeenCalledWith('USD');
    });
  });
});
