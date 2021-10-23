export class DiaporamaConfig {
  timeline: TimelineItem[];

  constructor(timeline: TimelineItem[]) {
    this.timeline = timeline;
  }
}

export interface TimelineItem {
}

export interface TimelineImageItem extends TimelineItem {
  image: string;
}

export interface TimelineVideoItem extends TimelineItem {
  video: string;
}

export interface TimelineCanvasItem extends TimelineItem {

}

export interface FileListConfig {
  files: FileItem[];
}

export interface FileItem {
  name: string;
  videoDurationInSeconds: number;
  slideText: string;
}
