import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';


@Component({
  selector: 'app-map-overview',
  imports: [LeafletModule],
  templateUrl: './map-overview.component.html',
  styleUrl: './map-overview.component.css'
})
export class MapOverviewComponent {

protected options: Leaflet.MapOptions = {

    layers: this.getLayers(),

    zoom: 12,

    center: new Leaflet.LatLng(43.530147, 16.488932)


  };

  protected getLayers(): Leaflet.Layer[] {

    return [
  
      new Leaflet.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  
        attribution: '&copy; OpenStreetMap contributors'
  
      } as Leaflet.TileLayerOptions),
  
    ] as Leaflet.Layer[];
  
  };
}
