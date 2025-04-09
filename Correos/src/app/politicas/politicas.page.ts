import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-politicas',
  templateUrl: './politicas.page.html',
  styleUrls: ['./politicas.page.scss'],
  standalone: false,
})
export class PoliticasPage implements OnInit {
  public isLargeScreen: boolean = false;
  constructor() {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  ngOnInit() {}

  // cambios tiempo real el tamaño de la fantalla sirve para sabes si estoy en un dispocitivo pequeño y asi hacer cambios en html
  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.isLargeScreen = window.innerWidth >= 765;
  }
}
