import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TheatersModule } from './theaters/theaters.module';
import { ProjectorsModule } from './projectors/projectors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isTest = process.env.NODE_ENV === 'test';
        return {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: Number(configService.get<string>('DB_PORT', '3306')),
          username: isTest
            ? configService.get<string>('DB_USERNAME', 'test')
            : configService.getOrThrow<string>('DB_USERNAME'),
          password: isTest
            ? configService.get<string>('DB_PASSWORD', 'test')
            : configService.getOrThrow<string>('DB_PASSWORD'),
          database: isTest
            ? configService.get<string>('DB_DATABASE', 'test')
            : configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production',
          manualInitialization: isTest,
        };
      },
    }),
    TheatersModule,
    ProjectorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
