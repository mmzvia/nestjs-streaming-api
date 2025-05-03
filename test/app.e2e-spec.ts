import {
  ClassSerializerInterceptor,
  ClassSerializerInterceptorOptions,
  HttpStatus,
  INestApplication,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('AppController (e2e)', () => {
  const SERVER_URL = 'http://localhost:3333';
  const ACCESS_TOKEN = '$S{access_token}';

  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();

    const vpOptitons: ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
    };
    const vp = new ValidationPipe(vpOptitons);
    app.useGlobalPipes(vp);

    const reflector = app.get(Reflector);
    const csiOptions: ClassSerializerInterceptorOptions = {
      excludeExtraneousValues: true,
    };
    const csi = new ClassSerializerInterceptor(reflector, csiOptions);
    app.useGlobalInterceptors(csi);

    app.use(helmet());

    prismaService = app.get(PrismaService);

    pactum.request.setBaseUrl(SERVER_URL);

    await app.init();
    await app.listen(3333);
  });

  beforeEach(async () => {
    await prismaService.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('/auth', () => {
    describe('POST /register', () => {
      it('should register new user', () => {
        const authDto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        const responseSchema = {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string', const: authDto.username },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'username', 'createdAt'],
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonSchema(responseSchema);
      });

      it('should return bad request when username is missing', () => {
        const authDto = { password: 'dummy' };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should return bad request when password is missing', () => {
        const authDto = { username: 'dummy@dummy.com' };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should return bad request when body contains extra field', () => {
        const authDto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
          extraField: 'dummy',
        };
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should return forbidden when username is taken', async () => {
        const authDto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        await pactum.spec().post('/auth/register').withBody(authDto);
        const duplicateAuthDto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        return await pactum
          .spec()
          .post('/auth/register')
          .withBody(duplicateAuthDto)
          .expectStatus(HttpStatus.FORBIDDEN);
      });
    });

    describe('POST /login', () => {
      it('should login', async () => {
        const dto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        await pactum.spec().post('/auth/register').withBody(dto);
        const responseSchema = {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
          },
          required: ['access_token'],
        };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectJsonSchema(responseSchema);
      });

      it('should return unauthorized when username is missing', () => {
        const dto = { password: 'dummy' };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should return unauthorized when password is missing', () => {
        const dto = { username: 'dummy@dummy.com' };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should return unauthorized when username is not valid', async () => {
        const dto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        await pactum.spec().post('/auth/register').withBody(dto);
        const invalidDto = { username: 'invalid', password: 'dummy' };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(invalidDto)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should return unauthorized when password not valid', async () => {
        const dto = {
          username: 'dummy@dummy.com',
          password: 'dummy',
        };
        await pactum.spec().post('/auth/register').withBody(dto);
        const invalidDto = { username: 'dummy', password: 'invalid' };
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(invalidDto)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
