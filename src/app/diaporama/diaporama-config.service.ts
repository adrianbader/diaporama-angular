import {concat, EMPTY, Observable} from 'rxjs';
import {catchError, first, map} from 'rxjs/operators';
import {
  DiaporamaConfig,
  FileItem,
  FileListConfig, KENBURNS_OPTIONS, RandomOption,
  TimelineCanvasItem,
  TimelineImageItem,
  TimelineItem,
  TimelineVideoItem
} from './diaporama';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DiaporamaConfigService {

  private static transitionDuration = 1000;
  private static videoFileEndings = ['.MOV', 'MP4'];
  private static imageFileEndings = ['.JPG', 'PNG', 'TIF', 'TIFF'];

  private slideDuration = 4000;
  private imageDuration = 5000;

  constructor(private httpClient: HttpClient, private router: Router) {
  }

  public diaporamaConfig$(forceFileScan: boolean, delay: number): Observable<DiaporamaConfig> {
    if (delay) {
      this.imageDuration = delay;
      this.slideDuration = delay;
    }

    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    let path = urlTree.toString();
    if (path !== '/') {
      path = `${urlTree.toString()}/`;
    }
    return concat(
      this.getDiaporamaJson(path).pipe(catchError(() => EMPTY)),
      this.getConfigFromFileJson(path, forceFileScan).pipe(catchError(() => EMPTY)))
      .pipe(first());
  }

  private getDiaporamaJson(path: string): Observable<DiaporamaConfig> {
    return this.httpClient.get<DiaporamaConfig>(`${path}diaporama.json`)
      .pipe(
        map(data => {
          data.timeline.forEach((item: any) => {
            if (item.image) {
              item.image = `${path}${item.image}`;
            }
            if (item.video) {
              item.video = `${path}${item.video}`;
            }
          });
          return data;
        }));
  }

  private getConfigFromFileJson(path: string, forceFileScan: boolean): Observable<DiaporamaConfig> {
    return this.httpClient.get<FileListConfig>(`${path}files.json${forceFileScan ? '?forceFileScan' : ''}`)
      .pipe(
        map(fileList => this.buildDiaporamaConfig(path, fileList)));
  }

  private buildDiaporamaConfig(path: string, fileList: FileListConfig): DiaporamaConfig {
    const timeline: TimelineItem[] = [];
    const randomOption = RandomOption.RANDOM_IF_NO_EFFECT_SPECIFIED;

    fileList.files.forEach(entry => {
      if (this.isSlide(entry.name)) {
        timeline.push(this.slideEntry(entry));
      }
      if (this.isVideo(entry.name)) {
        timeline.push(this.videoEntry(path, entry, randomOption));
      }
      if (this.isImage(entry.name)) {
        timeline.push(this.imageEntry(path, entry, randomOption));
      }
    });

    return new DiaporamaConfig(timeline, randomOption);
  }

  private isVideo(fileName: string): boolean {
    return DiaporamaConfigService.videoFileEndings
      .find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase())) !== undefined;
  }

  private isImage(fileName: string): boolean {
    return DiaporamaConfigService.imageFileEndings
      .find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase())) !== undefined;
  }

  private isSlide(fileName: string): boolean {
    return fileName.includes('t-');
  }

  private imageEntry(path: string, entry: FileItem, randomOption: RandomOption): any {
    return {
      image: `${path}${entry.name}`,
      duration: this.imageDuration,
      kenburns: this.kenburns(entry, randomOption),
      transitionNext: this.transition()
    };
  }

  private videoEntry(path: string, entry: FileItem, randomOption: RandomOption): TimelineVideoItem | any {
    return {
      video: `${path}${entry.name}`,
      duration: Math.max(0, entry.videoDurationInSeconds - DiaporamaConfigService.transitionDuration),
      volume: 1,
      loop: false,
      kenburns: this.kenburns(entry, randomOption),
      transitionNext: this.transition()
    };
  }

  private slideEntry(entry: FileItem): TimelineCanvasItem | any {
    const end = entry.name.lastIndexOf('.');
    const start = entry.name.indexOf('t-') + 2;

    const entries = entry.name.substr(start, end - start).split('--');
    let yStartOffset = 300 - (entries.length * 80 / 2) + 40;
    const fillTextEntries = entries.map(textEntry => {
      const line = ['fillText', textEntry, 400, yStartOffset];
      yStartOffset += 80;
      return line;
    });

    return {
      slide2d: {
        background: '#EDA',
        size: [800, 600],
        draws: [
          {font: 'bold 80px sans-serif', fillStyle: '#000', textBaseline: 'middle', textAlign: 'center'},
          fillTextEntries
        ]
      },
      duration: this.slideDuration,
      transitionNext: this.transition()
    };
  }


  private transition(): any {
    return {
      duration: DiaporamaConfigService.transitionDuration
    };
  }

  private kenburns(entry: FileItem, randomOption: RandomOption): any {
    const stringContainingEffect = entry.effect ? entry.effect : entry.name;
    let kenburnsOption = Object.entries(KENBURNS_OPTIONS)
      .filter(option => stringContainingEffect.includes(option[1]))
      .map(option => option[1].toString())
      .find(effectString => stringContainingEffect.includes(effectString));

    if (!kenburnsOption) {
      // kenburnsOption = this.buildRandomKenburnsOption(entry, randomOption);
    }

    if (!kenburnsOption) {
      kenburnsOption = this.buildHorizontalKenburnsOption(entry, randomOption);
    }

    switch (kenburnsOption) {
      case KENBURNS_OPTIONS.KENBURNS_CENTER_HORIZONTAL_UP:
        return {
          from: [1, [0.5, 0]],
          to: [1, [0.5, 1]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_HORIZONTAL_DOWN:
        return {
          from: [1, [0.5, 1]],
          to: [1, [0.5, 0]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_ZOOM_IN_HORIZONTAL_UP:
        return {
          from: [1, [0.5, 0]],
          to: [0.5, [0.5, 1]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_ZOOM_IN_HORIZONTAL_DOWN:
        return {
          from: [1, [0.5, 1]],
          to: [0.5, [0.5, 0]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_ZOOM_OUT_HORIZONTAL_UP:
        return {
          from: [0.5, [0.5, 0]],
          to: [1, [0.5, 1]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_ZOOM_OUT_HORIZONTAL_DOWN:
        return {
          from: [0.5, [0.5, 1]],
          to: [1, [0.5, 0]]
        };
      case KENBURNS_OPTIONS.KENBURNS_CENTER_ZOOM_IN:
        return {
          from: [1, [0.5, 0.5]],
          to: [0.5, [0.5, 0.5]]
        };
      case KENBURNS_OPTIONS.KENBURN_CENTER_ZOOM_OUT:
        return {
          from: [0.5, [0.5, 0.5]],
          to: [1, [0.5, 0.5]]
        };
    }

    return undefined;
  }

  private buildRandomKenburnsOption(entry: FileItem, randomOption: RandomOption): string | undefined {
    const entries = Object.entries(KENBURNS_OPTIONS)
      .filter(option => ((!entry.imageHeight && !entry.imageWidth) || (entry.imageHeight > entry.imageWidth) && option[0].includes('HORIZONTAL')) || (entry.imageHeight <= entry.imageWidth));

    const index = Math.floor(Math.random() * entries.length);
    return entries[index][1];
  }

  private buildHorizontalKenburnsOption(entry: FileItem, randomOption: RandomOption): string | undefined {
    if (entry.imageHeight > entry.imageWidth) {
      return KENBURNS_OPTIONS.KENBURNS_CENTER_HORIZONTAL_UP;
    }
    return undefined;
  }
}
