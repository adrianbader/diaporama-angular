import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, Subscription } from "rxjs";
import { applySourceSpanToExpressionIfNeeded } from '@angular/compiler/src/output/output_ast';
import { DiaporamaConfig } from './diaporama';
import { DiaporamaConfigService } from './diaporama-config.service';
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

  @ViewChild('diaporama', { static: true })
  private div: any;

  private diaporama: any;


  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private location: Location,
    private diaporamaConfigService: DiaporamaConfigService) {
  }

  ngOnInit(): void {

    if (this.route.snapshot.paramMap.get('slideIndex') != null) {
      const slideIndex = Number(this.route.snapshot.paramMap.get('slideIndex'));
      if (!isNaN(slideIndex)) {
        this.startSlideIndex = slideIndex;
      }
    }

    this.diaporamaConfigService.diaporamaConfig(this.path).subscribe(diaporamaConfig => {

      this.diaporama = Diaporama(this.div.nativeElement, diaporamaConfig, {
        width: this.div.nativeElement.clientWidth,
        height: this.div.nativeElement.clientHeight,
        autoplay: false
      });
      this.diaporama.slide = this.startSlideIndex;
      //this.diaporama.play();
      this.diaporama.on('slide', (slide: any) => {
        this.location.go(`/${this.diaporama.slide}`);
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
