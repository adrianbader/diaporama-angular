export class DiaporamaConfig {
  timeline: TimelineItem[];
  randomOption: RandomOption;

  constructor(timeline: TimelineItem[], random: RandomOption) {
    this.timeline = timeline;
    this.randomOption = random;
  }
}

export enum RandomOption {
  NO_RANDOM = 'NO_RANDOM',
  RANDOM_IF_NO_EFFECT_SPECIFIED = 'RANDOM_IF_NO_EFFECT_SPECIFIED',
  FORCE_RANDOM = 'FORCE_RANDOM'
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
  // may be used to set effect rather than take it from file name
  effect: string;
  imageWidth: number;
  imageHeight: number;
}

export enum KENBURNS_OPTIONS {
  KENBURNS_CENTER_HORIZONTAL_UP = 'k-ch u',
  KENBURNS_CENTER_HORIZONTAL_DOWN = 'k-ch d',
  KENBURNS_CENTER_ZOOM_IN_HORIZONTAL_UP = 'k-cih u',
  KENBURNS_CENTER_ZOOM_IN_HORIZONTAL_DOWN = 'k-cih d',
  KENBURNS_CENTER_ZOOM_OUT_HORIZONTAL_UP = 'k-coh u',
  KENBURNS_CENTER_ZOOM_OUT_HORIZONTAL_DOWN = 'k-coh d',
  KENBURNS_CENTER_ZOOM_IN = 'k-ci',
  KENBURN_CENTER_ZOOM_OUT = 'k-co',
}

