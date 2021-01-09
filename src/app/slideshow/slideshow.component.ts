import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss']
})
export class SlideshowComponent implements OnInit {

  @ViewChild('diaporamaComponent', {static: true})
  private _diaporamaComponent: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  playClick(): void {
    this.diaporama.paused = false;
  }

  public get diaporama() {
    const diaporama = this._diaporamaComponent ? this._diaporamaComponent.diaporama : undefined;
    return diaporama ? diaporama : {paused: true};
  }
}
