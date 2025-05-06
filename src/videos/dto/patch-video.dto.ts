import { IsString, MaxLength } from 'class-validator';

export class PatchVideoDto {
  @IsString()
  @MaxLength(60)
  title?: string;

  @IsString()
  @MaxLength(160)
  description?: string;
}
