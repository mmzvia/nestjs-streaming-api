import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadVideoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  description: string;
}
