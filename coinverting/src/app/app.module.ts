import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { CurrencyModule } from 'src/currency/currency.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: Joi.object({
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_DATABASE: Joi.string().required(),
            }),
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: () => ({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'admin123',
                database: process.env.DB_DATABASE || 'converter',
                autoLoadEntities: true,
                synchronize: true,
            }),

            inject: [ConfigService],
        }),

        CurrencyModule,
    ],

    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
