import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatchVideoDto, UploadVideoDto, VideoDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { stat, unlink } from 'fs/promises';
import * as parseRange from 'range-parser';
import { createReadStream } from 'fs';
import {
  ContentRange,
  PartialVideoStream,
  StreamableFileMetadata,
} from './types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const VIDEO_NOT_FOUND_MESSAGE = 'Video not found';
const FILE_NOT_FOUND_ERROR_CODE = 'ENOENT';
const RECORD_NOT_FOUND_ERROR_CODE = 'P2025';

@Injectable()
export class VideosService {
  private readonly uploadsDir: string;

  constructor(
    private readonly prismaService: PrismaService,
    configService: ConfigService,
  ) {
    this.uploadsDir = configService.get<string>('UPLOADS_DIR')!;
    if (!this.uploadsDir) {
      throw new Error('UPLOADS_DIR must be defined');
    }
  }

  async uploadFile(
    userId: string,
    dto: UploadVideoDto,
    video: Express.Multer.File,
  ): Promise<VideoDto> {
    const { title, description } = dto;
    const filePath = video.path;
    const uploadedVideo = await this.prismaService.video.create({
      data: {
        userId,
        title,
        description,
        filePath,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        uploadedAt: true,
      },
    });
    return uploadedVideo;
  }

  async getVideos(): Promise<VideoDto[]> {
    return this.prismaService.video.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        uploadedAt: true,
      },
    });
  }

  async getVideo(videoId: string): Promise<VideoDto> {
    const video = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        uploadedAt: true,
      },
    });
    if (!video) {
      throw new NotFoundException(VIDEO_NOT_FOUND_MESSAGE);
    }
    return video;
  }

  async getVideoStream(videoId: string): Promise<StreamableFile> {
    const { title, filePath, fileSize } =
      await this.getStreamableFileMetadata(videoId);
    const file = this.createStreamableFile(title, filePath);
    return file;
  }

  async getPartialVideoStream(
    videoId: string,
    rangeString: string,
  ): Promise<PartialVideoStream> {
    const { title, filePath, fileSize } =
      await this.getStreamableFileMetadata(videoId);
    const contentRange = this.getContentRange(fileSize, rangeString);
    const streamableFile = this.createStreamableFile(
      title,
      filePath,
      contentRange.start,
      contentRange.end,
    );
    return {
      contentRange,
      streamableFile,
    };
  }

  composeContentRangeString(range: ContentRange) {
    const { start, end, fileSize } = range;
    return `bytes ${start}-${end}/${fileSize}`;
  }

  async patchVideo(videoId: string, dto: PatchVideoDto): Promise<VideoDto> {
    try {
      const patchedVideo = await this.prismaService.video.update({
        where: { id: videoId },
        data: dto,
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          uploadedAt: true,
        },
      });
      return patchedVideo;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === RECORD_NOT_FOUND_ERROR_CODE
      ) {
        throw new NotFoundException(VIDEO_NOT_FOUND_MESSAGE);
      }
      throw error;
    }
  }

  async deleteVideo(videoId: string): Promise<VideoDto> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      select: {
        filePath: true,
      },
    });
    if (!video) {
      throw new NotFoundException(VIDEO_NOT_FOUND_MESSAGE);
    }
    try {
      await unlink(video.filePath);
    } catch (error) {
      if (error.code !== FILE_NOT_FOUND_ERROR_CODE) {
        throw error;
      }
    }
    const deletedVideo = await this.prismaService.video.delete({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        uploadedAt: true,
      },
    });
    return deletedVideo;
  }

  private async getStreamableFileMetadata(
    videoId: string,
  ): Promise<StreamableFileMetadata> {
    const video = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
      select: {
        title: true,
        filePath: true,
      },
    });
    if (!video) {
      throw new NotFoundException(VIDEO_NOT_FOUND_MESSAGE);
    }

    const { title, filePath } = video;
    const fileSize = await this.getFileSize(filePath);

    return { title, filePath, fileSize };
  }

  private async getFileSize(filePath: string): Promise<number> {
    const status = await stat(filePath);
    return status.size;
  }

  private getContentRange(fileSize: number, rangeString: string): ContentRange {
    const parseResult = parseRange(fileSize, rangeString);
    if (parseResult === -1 || parseResult === -2 || parseResult.length !== 1) {
      throw new BadRequestException();
    }
    const { start, end } = parseResult[0];
    return {
      start,
      end,
      fileSize,
    };
  }

  private createStreamableFile(
    title: string,
    filePath: string,
    start?: number,
    end?: number,
  ): StreamableFile {
    const stream = createReadStream(filePath, { start, end });
    return new StreamableFile(stream, {
      disposition: `inline; filename="${title}"`,
      type: 'mp4',
    });
  }
}
