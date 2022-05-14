/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General Public License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/


import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-button'
import '@vaadin/combo-box'
import {html, nothing} from 'lit';
import { customElement } from 'lit/decorators.js';
import { View } from '../../views/view';
import {galleryStore} from "Frontend/stores/gallery-store";
import {Router} from "@vaadin/router";
import {SortOrder} from "Frontend/stores/example-flames";
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {RandomFlame, randomizerStore} from "Frontend/stores/randomizer-store";
import {RenderPanel} from "Frontend/components/render-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import '../../components/render-panel'
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {playgroundStore} from "Frontend/stores/playground-store";

@customElement('randomizer-view')
export class RandomizerView extends View {

  render = () => {
    return html`
      <main class="max-w-screen-lg mx-auto pb-l px-l">
        <vaadin-horizontal-layout class="items-center justify-between">
          <vaadin-vertical-layout>
            <h2 class="mb-0 mt-xl text-3xl">Flame randomizer</h2>
            <p class="mb-xl mt-0 text-secondary">A gallery of example flames.</p>
            <p class="mb-xl mt-0 text-secondary">All images where rendered inside the browser</p>
          </vaadin-vertical-layout>

            <render-panel style="display: none;" .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel>

            <vaadin-button style="width: 14em;" ?disabled=${randomizerStore.calculating} theme="primary" @click="${this.createRandomFlame}">Generate random flame</vaadin-button>
       
            <swan-loading-indicator .loading=${randomizerStore.calculating} caption="Calculating..."></swan-loading-indicator>


            <div id="img-container"></div>
            
        </vaadin-horizontal-layout>
        <ol class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));">
          ${randomizerStore.randomFlames.map(
            (randomFlame) => html`
              <li class="bg-contrast-5 items-start p-m rounded-l">
                ${randomFlame ? this.renderRandomFlame(randomFlame): nothing}  
              </li>
            `
          )}
        </ol>
      </main>
    `;
  }

  renderRandomFlame = (randomFlame: RandomFlame) => {
    return html`
              <li class="bg-contrast-5 items-start p-m rounded-l">
                <div
                  class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
                  style="max-height: 12em;"
                >
                  <img alt=${randomFlame.title} @click="${this.renderExample.bind(this, randomFlame.name)}" class="w-full" style="cursor: pointer;" loading="lazy" src="${randomFlame.imgSrc}" />
                </div>
                <span class="text-xl font-semibold">${randomFlame.title}</span>
                ${(randomFlame.caption && randomFlame.caption!=='') ? html `<span class="text-s text-secondary">${randomFlame.caption}</span>`: nothing}  
                
                ${(randomFlame.description && randomFlame.description!=='') ? html `<p class = "my-m" >${randomFlame.description}</p>`: nothing}
                  <vaadin-button @click="${this.renderExample.bind(this, randomFlame.name)}">Render in Playground</vaadin-button>
              </li>
            `
  }

  connectedCallback = () => {
    super.connectedCallback();
    this.classList.add('flex', 'flex-col', 'h-full');
  }

  renderExample = (example: string) => {
      Router.go('/playground/'+example)
  }

  createRandomFlame = () => {
    randomizerStore.calculating = true
    randomizerStore.lastError = ''

    FlamesEndpoint.generateRandomFlame(playgroundStore.variations).then(
      randomFlame => {
        randomizerStore.refreshing = true
        try {
          randomizerStore.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
          this.getRenderPanel().rerenderFlame()
          randomizerStore.calculating = false
        }
        finally {
          randomizerStore.refreshing = false
        }
      }
    ).catch(err=> {
      randomizerStore.calculating = false
      randomizerStore.lastError = err
    })
  }

  getRenderPanel = (): RenderPanel =>  {
    const renderPnl = document.querySelector('render-panel')! as RenderPanel
    renderPnl.onRenderFinished = this.onRenderFinished
    return renderPnl
  }

  getCapturedImageContainer = (): HTMLDivElement => {
    return document.querySelector('#img-container')!
  }

  createFlameRenderer = ()=> {
    return new FlameRenderer(512, 128,
      DisplayMode.FLAME, this.getRenderPanel().canvas,
      this.getCapturedImageContainer(), true,
      '',
      undefined, 1.0,
      randomizerStore.currFlame)
  }

  onRenderFinished = (frameCount: number, elapsedTimeInS: number) => {
    const imgCnt = this.getCapturedImageContainer()
    const img = imgCnt.querySelector("img")
    if(img) {
      const rndFlame = new RandomFlame(randomizerStore.currFlame, img.src)
      const rndFlames = [...randomizerStore.randomFlames]
      rndFlames[randomizerStore.currFlameIdx] = rndFlame
      randomizerStore.randomFlames = [...rndFlames]
      randomizerStore.currFlameIdx++
    }
  }
}
