import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  SerializeOptions,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtGuard } from 'src/auth/guards';
import { PatchVideoDto, UploadVideoDto, VideoDto } from './dto';
import { VideoInterceptor } from 'src/uploads/interceptors';
import { User } from 'src/auth/decorators';
import { IsNotEmptyFilePipe } from 'src/uploads/pipes';
import { Response } from 'express';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(VideoInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ type: VideoDto })
  async uploadVideo(
    @User('id') userId: string,
    @Body() dto: UploadVideoDto,
    @UploadedFile(IsNotEmptyFilePipe) video: Express.Multer.File,
  ): Promise<VideoDto> {
    return this.videosService.uploadFile(userId, dto, video);
  }

  @Get()
  @SerializeOptions({ type: VideoDto })
  async getVideos(): Promise<VideoDto[]> {
    return this.videosService.getVideos();
  }

  @Get(':videoId')
  @SerializeOptions({ type: VideoDto })
  async getVideo(@Param('videoId') videoId: string): Promise<VideoDto> {
    return this.videosService.getVideo(videoId);
  }

  @Get(':videoId/stream')
  @Header('accept-ranges', 'bytes')
  async getPartialVideoStream(
    @Param('videoId') videoId: string,
    @Headers('range') range: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    if (!range) {
      return this.videosService.getVideoStream(videoId);
    }
    const { contentRange, streamableFile } =
      await this.videosService.getPartialVideoStream(videoId, range);
    const contentRangeHeaderValue =
      this.videosService.composeContentRangeString(contentRange);
    response.status(HttpStatus.PARTIAL_CONTENT);
    response.set({
      'Content-Range': contentRangeHeaderValue,
    });
    return streamableFile;
  }

  @Patch(':videoId')
  @UseGuards(JwtGuard)
  async patchVideo(
    @Param('videoId') videoId: string,
    @Body() dto: PatchVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.patchVideo(videoId, dto);
  }

  @Delete(':videoId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(@Param('videoId') videoId: string) {
    return this.videosService.deleteVideo(videoId);
  }
}
