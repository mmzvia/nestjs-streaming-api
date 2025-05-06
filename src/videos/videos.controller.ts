import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  SerializeOptions,
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
  async getVideo(@Param('videoId') videoId: string): Promise<VideoDto> {
    return this.videosService.getVideo(videoId);
  }

  @Get(':videoId/stream')
  @HttpCode(HttpStatus.CREATED)
  async streamVideo(@Param('videoId') videoId: string) {}

  @Patch(':videoId')
  @UseGuards(JwtGuard)
  async patchVideo(
    @Param('videoId') videoId: string,
    dto: PatchVideoDto,
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
