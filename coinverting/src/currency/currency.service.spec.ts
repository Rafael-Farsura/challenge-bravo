import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import {
  ConflictException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockCurrencyRepository: Partial<Repository<Currency>>;

  beforeEach(async () => {
    mockCurrencyRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: 'CurrencyRepository',
          useValue: mockCurrencyRepository,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  describe('convert', () => {
    it('should throw an error for invalid currency code', async () => {
      jest.spyOn(service as any, 'getValueInUSD').mockImplementation(() => {
        throw new NotAcceptableException('Could not accept this conversion');
      });

      await expect(
        service.convert({
          from: 'INVALID',
          to: 'EUR',
          amount: 100,
        }),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('create', () => {
    it('should throw an error if currency already exists', async () => {
      mockCurrencyRepository.findOne = jest
        .fn()
        .mockResolvedValue({ code: 'XYZ' });

      await expect(
        service.create({
          currency: 'XYZ',
          exchangeRateToUSD: 1.5,
          isFictional: false,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should add a fictional currency', async () => {
      mockCurrencyRepository.findOne = jest.fn().mockResolvedValue(null);

      jest.spyOn(service as any, 'isFictionalCurrency').mockResolvedValue(true);
      mockCurrencyRepository.create = jest.fn().mockReturnValue({
        code: 'XYZ',
        exchangeRateToUSD: 1.5,
        isFictional: true,
      });
      mockCurrencyRepository.save = jest.fn();

      jest.spyOn(service as any, 'validateCurrency').mockReturnValue(true);

      const result = await service.create({
        currency: 'XYZ',
        exchangeRateToUSD: 1.5,
        isFictional: true,
      });

      expect(result).toBe('XYZ was added successfully');
    });

    it('should add a non-fictional currency', async () => {
      mockCurrencyRepository.findOne = jest.fn().mockResolvedValue(null);

      jest
        .spyOn(service as any, 'isFictionalCurrency')
        .mockResolvedValue(false);
      jest.spyOn(service as any, 'fetchExchangeRate').mockResolvedValue(1.2);
      mockCurrencyRepository.create = jest.fn().mockReturnValue({
        code: 'ABC',
        exchangeRateToUSD: 1.2,
        isFictional: false,
      });
      mockCurrencyRepository.save = jest.fn();

      jest.spyOn(service as any, 'validateCurrency').mockReturnValue(true);

      const result = await service.create({
        currency: 'ABC',
        isFictional: false,
        exchangeRateToUSD: 1.2,
      });

      expect(result).toBe('ABC was added successfully');
    });
  });

  describe('remove', () => {
    it('should throw an error if currency does not exist', async () => {
      jest.spyOn(service as any, 'validateCurrency').mockImplementation(() => {
        throw new NotFoundException('Currency not found');
      });

      await expect(service.remove('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllCurrencies', () => {
    it('should return list of currencies', async () => {
      const mockCurrencies = [
        { code: 'USD', exchangeRateToUSD: 1, isFictional: false },
        { code: 'EUR', exchangeRateToUSD: 0.85, isFictional: false },
      ];

      mockCurrencyRepository.find = jest.fn().mockResolvedValue(mockCurrencies);

      const result = await service.findAllCurrencies();

      expect(result).toEqual(mockCurrencies);
    });
  });

  describe('findOneCurrency', () => {
    it('should return currency', async () => {
      const mockCurrency: Currency = {
        id: 1,
        code: 'USD',
        exchangeRateToUSD: 1,
        isFictional: false,
      };

      mockCurrencyRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockCurrency);

      const result = await service.findOneCurrency(mockCurrency.code);

      expect(result).toEqual(mockCurrency);
    });
  });
});
