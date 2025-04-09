import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


// para los forms
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalComponent implements OnInit{
  @Input() correo: any;
  mapContainer: HTMLElement | null = null;

  constructor(private modalController: ModalController) {}

  cerrarModal() {
    this.modalController.dismiss(); // Cierra la modal
  }
  
  ngOnInit() {
    // console.log(this.correo);
    setTimeout(() => {
      this.loadMap();
    }, 2000);
  }


  async loadMap() {
    const lat = Number(this.correo.latitud);
    const lon = Number(this.correo.longitud);

    if (isNaN(lat) || isNaN(lon)) {
      console.error('Coordenadas inválidas:', lat, lon);
      return;
    }

    // Obtener el contenedor del mapa
    this.mapContainer = document.getElementById('mapID');
    if (!this.mapContainer) {
      console.error('Contenedor del mapa no encontrado.');
      return;
    }

    // Limpiar el contenido previo
    this.mapContainer.innerHTML = '';

    // Insertar el mapa con las coordenadas del correo
    const mapHtml = `
      <iframe
        width="100%"
        height="400px"
        frameborder="0"
        src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"
        allowfullscreen>
      </iframe>`;

    this.mapContainer.innerHTML = mapHtml;
  }

}
