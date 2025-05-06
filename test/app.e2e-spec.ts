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
import { rmSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  const SERVER_URL = 'http://localhost:3333';
  const ACCESS_TOKEN = '$S{access_token}';

  let app: INestApplication;
  let prismaService: PrismaService;
  let uploadsDir: string;

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

    const configService = app.get(ConfigService);
    uploadsDir = configService.get<string>('UPLOADS_DIR')!;

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

  // describe('/auth', () => {
  //   describe('POST /register', () => {
  //     it('should register new user', () => {
  //       const authDto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       const responseSchema = {
  //         type: 'object',
  //         properties: {
  //           id: { type: 'string', format: 'uuid' },
  //           username: { type: 'string', const: authDto.username },
  //           createdAt: { type: 'string', format: 'date-time' },
  //         },
  //         required: ['id', 'username', 'createdAt'],
  //       };
  //       return pactum
  //         .spec()
  //         .post('/auth/register')
  //         .withBody(authDto)
  //         .expectStatus(HttpStatus.CREATED)
  //         .expectJsonSchema(responseSchema);
  //     });

  //     it('should return bad request when username is missing', () => {
  //       const authDto = { password: 'dummy' };
  //       return pactum
  //         .spec()
  //         .post('/auth/register')
  //         .withBody(authDto)
  //         .expectStatus(HttpStatus.BAD_REQUEST);
  //     });

  //     it('should return bad request when password is missing', () => {
  //       const authDto = { username: 'dummy@dummy.com' };
  //       return pactum
  //         .spec()
  //         .post('/auth/register')
  //         .withBody(authDto)
  //         .expectStatus(HttpStatus.BAD_REQUEST);
  //     });

  //     it('should return bad request when body contains extra field', () => {
  //       const authDto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //         extraField: 'dummy',
  //       };
  //       return pactum
  //         .spec()
  //         .post('/auth/register')
  //         .withBody(authDto)
  //         .expectStatus(HttpStatus.BAD_REQUEST);
  //     });

  //     it('should return forbidden when username is taken', async () => {
  //       const authDto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       await pactum.spec().post('/auth/register').withBody(authDto);
  //       const duplicateAuthDto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       return await pactum
  //         .spec()
  //         .post('/auth/register')
  //         .withBody(duplicateAuthDto)
  //         .expectStatus(HttpStatus.FORBIDDEN);
  //     });
  //   });

  //   describe('POST /login', () => {
  //     it('should login', async () => {
  //       const dto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       await pactum.spec().post('/auth/register').withBody(dto);
  //       const responseSchema = {
  //         type: 'object',
  //         properties: {
  //           access_token: { type: 'string' },
  //         },
  //         required: ['access_token'],
  //       };
  //       return pactum
  //         .spec()
  //         .post('/auth/login')
  //         .withBody(dto)
  //         .expectStatus(HttpStatus.OK)
  //         .expectJsonSchema(responseSchema);
  //     });

  //     it('should return unauthorized when username is missing', () => {
  //       const dto = { password: 'dummy' };
  //       return pactum
  //         .spec()
  //         .post('/auth/login')
  //         .withBody(dto)
  //         .expectStatus(HttpStatus.UNAUTHORIZED);
  //     });

  //     it('should return unauthorized when password is missing', () => {
  //       const dto = { username: 'dummy@dummy.com' };
  //       return pactum
  //         .spec()
  //         .post('/auth/login')
  //         .withBody(dto)
  //         .expectStatus(HttpStatus.UNAUTHORIZED);
  //     });

  //     it('should return unauthorized when username is not valid', async () => {
  //       const dto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       await pactum.spec().post('/auth/register').withBody(dto);
  //       const invalidDto = { username: 'invalid', password: 'dummy' };
  //       return pactum
  //         .spec()
  //         .post('/auth/login')
  //         .withBody(invalidDto)
  //         .expectStatus(HttpStatus.UNAUTHORIZED);
  //     });

  //     it('should return unauthorized when password not valid', async () => {
  //       const dto = {
  //         username: 'dummy@dummy.com',
  //         password: 'dummy',
  //       };
  //       await pactum.spec().post('/auth/register').withBody(dto);
  //       const invalidDto = { username: 'dummy', password: 'invalid' };
  //       return pactum
  //         .spec()
  //         .post('/auth/login')
  //         .withBody(invalidDto)
  //         .expectStatus(HttpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });

  describe('/videos', () => {
    beforeEach(async () => {
      const authDto = {
        username: 'dummy@dummy.com',
        password: 'dummy',
      };
      await pactum
        .spec()
        .post('/auth/register')
        .withBody(authDto)
        .stores('userId', 'id');
      await pactum
        .spec()
        .post('/auth/login')
        .withBody(authDto)
        .returns('access_token')
        .stores('access_token', 'access_token');
    });

    afterAll(() => {
      rmSync(uploadsDir, { recursive: true, force: true });
    });

    describe('POST /videos', () => {
      it('should upload a video', async () => {
        const dto = {
          title: 'dummy title',
          description: 'dummy description',
        };
        const videoBuffer = Buffer.from('dummy');
        const videMetadata = {
          filename: 'dummy.mp4',
          contentType: 'video/mp4',
        };
        const responseSchema = {
          type: 'object',
          required: ['id', 'userId', 'title', 'description', 'uploadedAt'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', const: '$S{userId}' },
            title: { type: 'string', const: dto.title },
            description: { type: 'string', const: dto.description },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(dto)
          .withMultiPartFormData('video', videoBuffer, videMetadata)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonSchema(responseSchema);
      });

      it('should return unauthorized when auth token is missing or invalid', async () => {
        await pactum
          .spec()
          .post('/videos')
          .expectStatus(HttpStatus.UNAUTHORIZED);
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken('invalid_token')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should return bad request when dto or video is missing or invalid', async () => {
        const videoBuffer = Buffer.from('dummy');
        const videMetadata = {
          filename: 'dummy.mp4',
          contentType: 'video/mp4',
        };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData('video', videoBuffer, videMetadata)
          .expectStatus(HttpStatus.BAD_REQUEST);

        const missingRequiredFiledsDto = { description: 'dummy description' };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(missingRequiredFiledsDto)
          .withMultiPartFormData('video', videoBuffer, videMetadata)
          .expectStatus(HttpStatus.BAD_REQUEST);

        const dto = {
          title: 'dummy title',
          description: 'dummy description',
        };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(dto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /videos', () => {
      it('should return uploaded videos', async () => {
        const dto = {
          title: 'dummy title',
          description: 'dummy description',
        };
        const videoBuffer = Buffer.from('dummy');
        const videMetadata = {
          filename: 'dummy.mp4',
          contentType: 'video/mp4',
        };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(dto)
          .withMultiPartFormData('video', videoBuffer, videMetadata);
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(dto)
          .withMultiPartFormData('video', videoBuffer, videMetadata);

        const responseSchema = {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: {
            type: 'object',
            required: ['id', 'userId', 'title', 'description', 'uploadedAt'],
            additionalProperties: false,
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', const: '$S{userId}' },
              title: { type: 'string' },
              description: { type: 'string' },
              uploadedAt: { type: 'string', format: 'date-time' },
            },
          },
        };
        await pactum
          .spec()
          .get('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .expectStatus(HttpStatus.OK)
          .expectJsonSchema(responseSchema);
      });

      it('should return empty array when there is no uploaded videos', async () => {
        await pactum
          .spec()
          .get('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0);
      });
    });

    describe('GET /videos/:videoId', () => {
      it('should return specified video', async () => {
        const dto = {
          title: 'dummy title',
          description: 'dummy description',
        };
        const videoBuffer = Buffer.from('dummy');
        const videMetadata = {
          filename: 'dummy.mp4',
          contentType: 'video/mp4',
        };
        await pactum
          .spec()
          .post('/videos')
          .withBearerToken(ACCESS_TOKEN)
          .withMultiPartFormData(dto)
          .withMultiPartFormData('video', videoBuffer, videMetadata)
          .stores('videoId', 'id');

        const responseSchema = {
          type: 'object',
          required: ['id', 'userId', 'title', 'description', 'uploadedAt'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', const: '$S{userId}' },
            title: { type: 'string' },
            description: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        };
        await pactum
          .spec()
          .get('/videos/$S{videoId}')
          .expectStatus(HttpStatus.OK)
          .expectJsonSchema(responseSchema);
      });

      it('should return not found when video does not exist', async () => {
        await pactum
          .spec()
          .get('/videos/invalid_id')
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });

    describe('GET /videos/:videoId/stream', () => {});
  });
});
