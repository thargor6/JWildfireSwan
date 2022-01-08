import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/vertical-layout';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { View } from '../../views/view';

interface Image {
  text: string;
  url: string;
}
@customElement('image-list-view')
export class ImageListView extends View {
  @state()
  private images: Image[] = [
    {
      text: 'Snow mountain under stars',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    },
    {
      text: 'Snow covered mountain',
      url: 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    },
    {
      text: 'River between mountains',
      url: 'https://images.unsplash.com/photo-1536048810607-3dc7f86981cb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=375&q=80',
    },
    {
      text: 'Milky way on mountains',
      url: 'https://images.unsplash.com/photo-1515705576963-95cad62945b6?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=750&q=80',
    },
    {
      text: 'Mountain with fog',
      url: 'https://images.unsplash.com/photo-1513147122760-ad1d5bf68cdb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    },
    {
      text: 'Mountain at night',
      url: 'https://images.unsplash.com/photo-1562832135-14a35d25edef?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=815&q=80',
    },
  ];

  render() {
    return html`
      <main class="max-w-screen-lg mx-auto pb-l px-l">
        <vaadin-horizontal-layout class="items-center justify-between">
          <vaadin-vertical-layout>
            <h2 class="mb-0 mt-xl text-3xl">Beautiful photos</h2>
            <p class="mb-xl mt-0 text-secondary">Royalty free photos and pictures, courtesy of Unsplash</p>
          </vaadin-vertical-layout>
          <vaadin-select label="Sort by" value="Popularity">
            <template>
              <vaadin-list-box>
                <vaadin-item>Popularity</vaadin-item>
                <vaadin-item>Newest first</vaadin-item>
                <vaadin-item>Oldest first</vaadin-item>
              </vaadin-list-box>
            </template>
          </vaadin-select>
        </vaadin-horizontal-layout>
        <ol class="gap-m grid list-none m-0 p-0">
          ${this.images.map(
            (image) => html`
              <li class="bg-contrast-5 flex flex-col items-start p-m rounded-l">
                <div
                  class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
                  style="height: 160px;"
                >
                  <img alt=${image.text} class="w-full" loading="lazy" src=${image.url} />
                </div>
                <span class="text-xl font-semibold">Title</span>
                <span class="text-s text-secondary">Card subtitle</span>
                <p class="my-m">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut.
                </p>
                <span theme="badge">Label</span>
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
