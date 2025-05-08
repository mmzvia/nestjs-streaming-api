import { StreamableFile } from '@nestjs/common';
import { ContentRange } from './content-range.type';

export interface PartialVideoStream {
  contentRange: ContentRange;
  streamableFile: StreamableFile;
}
