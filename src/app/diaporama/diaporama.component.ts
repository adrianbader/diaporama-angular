import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {fromEvent} from "rxjs";
import {DiaporamaConfigService} from './diaporama-config.service';

declare var Diaporama: any;

@Component({
  selector: 'app-diaporama',
  templateUrl: './diaporama.component.html',
  styleUrls: ['./diaporama.component.scss']
})
export class DiaporamaComponent implements OnInit {
  @Input()
  public startSlideIndex = 0;

  @Input()
  public path = './assets/';

  @ViewChild('diaporama', {static: true})
  private div: any;

  public diaporama: any;

  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private router: Router,
              private diaporamaConfigService: DiaporamaConfigService) {
  }

  ngOnInit(): void {
    let forceFileScan = false;
    if (this.route.snapshot.queryParamMap.get('slideIndex') != null) {
      const slideIndex = Number(this.route.snapshot.queryParamMap.get('slideIndex'));
      if (!isNaN(slideIndex)) {
        this.startSlideIndex = slideIndex;
      }
    }

    if (this.route.snapshot.queryParamMap.get('forceFileScan') != null) {
      forceFileScan = true;
    }

    const imageDelay: number = Number(this.route.snapshot.queryParamMap.get('delay'));

    this.diaporamaConfigService.diaporamaConfig$(forceFileScan, imageDelay).subscribe(diaporamaConfig => {

      this.diaporama = Diaporama(this.div.nativeElement, diaporamaConfig, {
        width: this.div.nativeElement.clientWidth,
        height: this.div.nativeElement.clientHeight,
        autoplay: false
      });
      this.diaporama.slide = this.startSlideIndex;
      //this.diaporama.play();
      this.diaporama.on('slide', (slide: any) => {
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: {slideIndex: this.diaporama.slide},
            queryParamsHandling: 'merge'
          });
      })

      fromEvent(window, 'resize').subscribe(() => {
        this.diaporama.width = this.div.nativeElement.clientWidth;
        this.diaporama.height = this.div.nativeElement.clientHeight;
      })

      fromEvent(document.body, 'keydown').subscribe((key: any) => {
        switch (key.which) {
          case 37: // Left
            this.diaporama.prev();
            break;
          case 39: // Right
            this.diaporama.next();
            break;
          case 32: // Space
          case 13: // Enter
            this.diaporama.paused = !this.diaporama.paused;
            break;
          case 27: // Esc
            this.diaporama.paused = true;
            break;
        }
      });
    });

  }

}
