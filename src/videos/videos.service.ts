import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatchVideoDto, UploadVideoDto, VideoDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';

const VIDEO_NOT_FOUND_MESSAGE = 'Video not found';
const FILE_NOT_FOUND_CODE = 'ENOENT';

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

  async patchVideo(videoId: string, dto: PatchVideoDto): Promise<VideoDto> {
    const patchedVideo = this.prismaService.video.update({
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
    if (!patchedVideo) {
      throw new NotFoundException(VIDEO_NOT_FOUND_MESSAGE);
    }
    return patchedVideo;
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
      if (error.code !== FILE_NOT_FOUND_CODE) {
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
}
