import { concat, EMPTY, Observable } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { DiaporamaConfig, FileListConfig, TimelineItem, FileItem, TimelineImageItem, TimelineVideoItem, TimelineCanvasItem } from './diaporama';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiaporamaConfigService {

  private static imageDuration = 3500;
  private static slideDuration = 4000;
  private static transitionDuration = 1000;
  private static videoFileEndings = ['.MOV', 'MP4'];
  private static imageFileEndings = ['.JPG', 'PNG', 'TIF', 'TIFF'];

  constructor(private httpClient: HttpClient) {
  }

  public diaporamaConfig(path: String): Observable<DiaporamaConfig> {
    return concat(
      this.getDiaporamaJson(path).pipe(catchError(() => EMPTY)),
      this.getConfigFromFileJson(path).pipe(catchError(() => EMPTY)))
      .pipe(first());
  }

  private getDiaporamaJson(path: String): Observable<DiaporamaConfig> {
    return this.httpClient.get<DiaporamaConfig>(`${path}diaporama.json`)
      .pipe(
        map(data => {
          data.timeline.forEach((item: any) => {
            if (item.image) {
              item.image = `${path}${item.image}`;
            }
          })
          return data;
        }));
  }

  private getConfigFromFileJson(path: String): Observable<DiaporamaConfig> {
    return this.httpClient.get<FileListConfig>(`${path}files.json`)
      .pipe(
        map(fileList => this.buildDiaporamaConfig(fileList)));
  }

  private buildDiaporamaConfig(fileList: FileListConfig): DiaporamaConfig {
    const timeline: TimelineItem[] = [];

    fileList.files.forEach(entry => {
      if (this.isSlide(entry.name)) {
        timeline.push(this.slideEntry(entry));
      }
      if (this.isVideo(entry.name)) {
        timeline.push(this.videoEntry(entry));
      }
      if (this.isImage(entry.name)) {
        timeline.push(this.imageEntry(entry));
      }
    });

    return new DiaporamaConfig(timeline);
  }

  private isVideo(fileName: string): boolean {
    return DiaporamaConfigService.videoFileEndings.find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase())) != undefined;
  }

  private isImage(fileName: string): boolean {
    return DiaporamaConfigService.imageFileEndings.find(ending => fileName.toUpperCase().endsWith(ending.toUpperCase())) != undefined;
  }

  private isSlide(fileName: string): boolean {
    return fileName.includes('t-');
  }

  private imageEntry(entry: FileItem): TimelineImageItem | any {
    return {
      image: entry.name,
      duration: DiaporamaConfigService.imageDuration,
      kenburns: this.kenburns(entry),
      transitionNext: this.transition()
    }

  }

  private videoEntry(entry: FileItem): TimelineVideoItem | any {
    return {
      video: entry.name,
      duration: Math.max(0, entry.videoDurationInSeconds - DiaporamaConfigService.transitionDuration),
      volume: 1,
      loop: false,
      kenburns: this.kenburns(entry),
      transitionNext: this.transition()
    }
  }

  private slideEntry(entry: FileItem): TimelineCanvasItem | any {
    const end = entry.name.lastIndexOf('.');
    const start = entry.name.indexOf('t-') + 2;

    return {
      slide2d: {
        background: "#EDA",
        size: [800, 600],
        draws: [
          //              ["drawImage", `${diaporamaPathBeforeRef}${fileName}`, 0, 0, 800, 600],
          { font: "bold 80px sans-serif", fillStyle: "#000", textBaseline: "middle", "textAlign": "center" },
          ["fillText", entry.name.substr(start, end), 400, 300]
        ]
      },
      duration: DiaporamaConfigService.slideDuration,
      transitionNext: this.transition()
    }
  }


  private transition() {
    return {
      duration: DiaporamaConfigService.transitionDuration
    };
  }

  private kenburns(entry: FileItem) {
    if (entry.name.includes('k-ci')) {
      return {
        from: [1, [0.5, 0.5]],
        to: [0.5, [0.5, 0.5]]
      }
    }
    if (entry.name.includes('k-co')) {
      return {
        from: [0.5, [0.5, 0.5]],
        to: [1, [0.5, 0.5]]
      }
    }
    return undefined;
  }

}
