import {concat, EMPTY, Observable} from 'rxjs';
import {catchError, first, map} from 'rxjs/operators';
import {
  DiaporamaConfig,
  FileItem,
  FileListConfig,
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

  private static imageDuration = 3500;
  private static slideDuration = 4000;
  private static transitionDuration = 1000;
  private static videoFileEndings = ['.MOV', 'MP4'];
  private static imageFileEndings = ['.JPG', 'PNG', 'TIF', 'TIFF'];

  constructor(private httpClient: HttpClient, private router: Router) {
  }

  public diaporamaConfig(): Observable<DiaporamaConfig> {
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    let path = urlTree.toString();
    if (path !== '/') {
      path = `${urlTree.toString()}/`;
    }
    return concat(
      this.getDiaporamaJson(path).pipe(catchError(() => EMPTY)),
      this.getConfigFromFileJson(path).pipe(catchError(() => EMPTY)))
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

  private getConfigFromFileJson(path: string): Observable<DiaporamaConfig> {
    return this.httpClient.get<FileListConfig>(`${path}files.json`)
      .pipe(
        map(fileList => this.buildDiaporamaConfig(path, fileList)));
  }

  private buildDiaporamaConfig(path: string, fileList: FileListConfig): DiaporamaConfig {
    const timeline: TimelineItem[] = [];

    fileList.files.forEach(entry => {
      if (this.isSlide(entry.name)) {
        timeline.push(this.slideEntry(entry));
      }
      if (this.isVideo(entry.name)) {
        timeline.push(this.videoEntry(path, entry));
      }
      if (this.isImage(entry.name)) {
        timeline.push(this.imageEntry(path, entry));
      }
    });

    return new DiaporamaConfig(timeline);
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

  private imageEntry(path: string, entry: FileItem): TimelineImageItem | any {
    return {
      image: `${path}${entry.name}`,
      duration: DiaporamaConfigService.imageDuration,
      kenburns: this.kenburns(entry),
      transitionNext: this.transition()
    };
  }

  private videoEntry(path: string, entry: FileItem): TimelineVideoItem | any {
    return {
      video: `${path}${entry.name}`,
      duration: Math.max(0, entry.videoDurationInSeconds - DiaporamaConfigService.transitionDuration),
      volume: 1,
      loop: false,
      kenburns: this.kenburns(entry),
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
      duration: DiaporamaConfigService.slideDuration,
      transitionNext: this.transition()
    };
  }


  private transition(): any {
    return {
      duration: DiaporamaConfigService.transitionDuration
    };
  }

  private kenburns(entry: FileItem): any {
    if (entry.name.includes('k-ci')) {
      return {
        from: [1, [0.5, 0.5]],
        to: [0.5, [0.5, 0.5]]
      };
    }

    if (entry.name.includes('k-co')) {
      return {
        from: [0.5, [0.5, 0.5]],
        to: [1, [0.5, 0.5]]
      };

    }
    return undefined;
  }

}
