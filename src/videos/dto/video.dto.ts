import { Expose } from 'class-transformer';

export class VideoDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  title: string;

  @Expose()
  description: string | null;

  @Expose()
  uploadedAt: Date;

  constructor(partial: Partial<VideoDto>) {
    Object.assign(this, partial);
  }
}
