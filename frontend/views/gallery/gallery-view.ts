import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-button'
import {html, nothing} from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { View } from '../../views/view';
import {galleryStore} from "Frontend/stores/gallery-store";



@customElement('gallery-view')
export class ImageListView extends View {

  render() {
    return html`
      <main class="max-w-screen-lg mx-auto pb-l px-l">
        <vaadin-horizontal-layout class="items-center justify-between">
          <vaadin-vertical-layout>
            <h2 class="mb-0 mt-xl text-3xl">Gallery</h2>
            <p class="mb-xl mt-0 text-secondary">A gallery of example flames. All images where rendered inside the browser</p>
          </vaadin-vertical-layout>
        </vaadin-horizontal-layout>
        <ol class="gap-m grid list-none m-0 p-0">
          ${galleryStore.exampleFlames.map(
            (example) => html`
              <li class="bg-contrast-5 flex flex-col items-start p-m rounded-l">
                <div
                  class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
                  style="height: 160px;"
                >
                  <img alt=${example.title} class="w-full" loading="lazy" src="./images/${example.name}.jpg" />
                </div>
                <span class="text-xl font-semibold">${example.title}</span>
                <span class="text-s text-secondary">${example.caption}</span>
                ${(example.description && example.description!=='') ? html `<p class = "my-m" >${example.description}</p>`: nothing}
                ${example.tags.length > 0 ? html `${example.tags.map(tag => html `#${tag} `)}` : nothing}
              </li>
            `
          )}
        </ol>
      </main>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('flex', 'flex-col', 'h-full');
  }
}
