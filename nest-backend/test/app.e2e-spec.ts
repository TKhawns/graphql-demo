import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('GraphQL (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('returns products list', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ products { id name } }' })
      .expect(200)
      .expect((res) => {
        if (!Array.isArray(res.body.data.products)) {
          throw new Error('products should be an array');
        }
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
