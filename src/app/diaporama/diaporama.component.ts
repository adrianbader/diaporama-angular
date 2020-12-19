import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, Subscription } from "rxjs";
declare var Diaporama: any;

@Component({
  selector: 'app-diaporama',
  templateUrl: './diaporama.component.html',
  styleUrls: ['./diaporama.component.scss']
})
export class DiaporamaComponent implements OnInit {
  @ViewChild('diaporama', { static: true })
  div: any;

  diaporama: any;
  startSlideIndex = 0;

  constructor(private httpClient: HttpClient, private route: ActivatedRoute, private location: Location) {
    const slideIndex = Number(this.route.snapshot.paramMap.get('slideIndex'));
    if (!isNaN(slideIndex)) {
      this.startSlideIndex = slideIndex;
    }
  }

  ngOnInit(): void {

    this.httpClient.get('assets/diaporama.json').subscribe(data => {

      this.diaporama = Diaporama(this.div.nativeElement, data, {
        width: this.div.nativeElement.clientWidth,
        height: this.div.nativeElement.clientHeight,
        autoplay: false
      });
      this.diaporama.slide = this.startSlideIndex;
      this.diaporama.play();
      this.diaporama.on('slide', (slide: any) => {
        this.location.go(`/${this.diaporama.slide}`);
      })

      fromEvent(window, 'resize').subscribe(() => {
        this.diaporama.width = this.div.nativeElement.clientWidth;
        this.diaporama.height = this.div.nativeElement.clientHeight;
      })

      fromEvent(document.body, 'keydown').subscribe((key:any) => {
        switch (key.which) {
          case 37: // Left
            this.diaporama.prev();
            break;
          case 39: // Right
            this.diaporama.next();
            break;
          case 32: // Space
          case 13: // Space
            this.diaporama.paused = !this.diaporama.paused;
            break;
        }
        });
    });

  }

}
