import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/vertical-layout';
import {html, nothing} from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { View } from '../../views/view';

interface Example {
  title: string;
  name: string;
  caption: string;
  description?: string;
  tags: string[];
}

@customElement('gallery-view')
export class ImageListView extends View {
  @state()
  private examples: Example[] = [
    {
      title: 'Example 1',
      name: 'example01',
      caption: 'First example ever',
      description: '',
      tags: ['example']
    },
    {
      title: 'Example 2',
      name: 'example02',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 3',
      name: 'example03',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 4',
      name: 'example04',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 5',
      name: 'example05',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 6',
      name: 'example06',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 7',
      name: 'example07',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 8',
      name: 'example08',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 9',
      name: 'example09',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 10',
      name: 'example10',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 11',
      name: 'example11',
      caption: '',
      tags: ['example']
    },
      /*
    {
      title: 'Example 12',
      name: 'example12',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 13',
      name: 'example13',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 14',
      name: 'example14',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 15',
      name: 'example15',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 16',
      name: 'example16',
      caption: '',
      tags: ['example']
    },/*
    {
      title: 'Example 17',
      name: 'example17',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 18',
      name: 'example18',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 19',
      name: 'example19',
      caption: '',
      tags: ['example']
    },*/

      /*
    {
      title: 'Example 20',
      name: 'example20',
      caption: '',
      tags: ['example']
    },*/
    /*
    {
      title: 'Example 21',
      name: 'example21',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 22',
      name: 'example22',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 23',
      name: 'example23',
      caption: '',
      tags: ['example']
    },/*
    {
      title: 'Example 24',
      name: 'example24',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 25',
      name: 'example25',
      caption: '',
      tags: ['example']
    },/*
    {
      title: 'Example 26',
      name: 'example26',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 27',
      name: 'example27',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 28',
      name: 'example28',
      caption: '',
      tags: ['example']
    },/*
    {
      title: 'Example 29',
      name: 'example29',
      caption: '',
      tags: ['example']
    },*/
      /*
    {
      title: 'Example 30',
      name: 'example30',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 31',
      name: 'example31',
      caption: '',
      tags: ['example']
    },/*
    {
      title: 'Example 32',
      name: 'example32',
      caption: '',
      tags: ['example']
    },*/
    {
      title: 'Example 33',
      name: 'example33',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 34',
      name: 'example34',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 35',
      name: 'example35',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 36',
      name: 'example36',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 37',
      name: 'example37',
      caption: '',
      tags: ['example']
    },
    {
      title: 'Example 38',
      name: 'example38',
      caption: '',
      tags: ['example']
    },
  ];

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
          ${this.examples.map(
            (example) => html`
              <li class="bg-contrast-5 flex flex-col items-start p-m rounded-l">
                <div
                  class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
                  style="height: 160px;"
                >
                  <img alt=${example.title} class="w-full" loading="lazy" src="./images/${example.name}.png" />
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
