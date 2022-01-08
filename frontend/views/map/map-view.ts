import * as L from 'leaflet';
import { html, PropertyValues } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { View } from '../../views/view';

const openStreetMapLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const openStreetMapAttribution = `&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors`;

@customElement('map-view')
export class MapView extends View {
  @query('.map')
  private mapContainer!: HTMLElement;

  private map!: L.Map;

  render() {
    return html`<div class="map"></div>`;
  }

  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.map = L.map(this.mapContainer);
    this.map.setView([55, 10], 4);

    const tileLayer = L.tileLayer(openStreetMapLayer, { attribution: openStreetMapAttribution, maxZoom: 13 });
    tileLayer.addTo(this.map);
  }
}
