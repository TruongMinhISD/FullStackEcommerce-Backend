import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import ormConfig from 'config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from './httpExceptionFillter';
import { UsersModule } from './users/users.module';
import { TransformationInterceptor } from './responseInterceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: ormConfig,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILLTER',
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
