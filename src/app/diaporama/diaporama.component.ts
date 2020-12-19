import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    this.div.nodeType = true;
    this.diaporama = Diaporama(this.div.nativeElement, {}, { width: window.innerWidth, height: window.innerHeight, autplay: true });
  }

}
