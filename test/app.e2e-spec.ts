import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { validate } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let test = new CreateUserDto();
  test.email = 'Admin';

  validate(test).then((errors) => {
    // errors is an array of validation errors
    if (errors.length > 0) {
      console.log('validation failed. errors: ', errors);
    } else {
      console.log('validation succeed');
    }
  });
});
