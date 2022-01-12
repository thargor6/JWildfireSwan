import {html, PropertyValues} from 'lit';
import { customElement } from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'

@customElement('empty-view')
export class EmptyView extends View {
  render() {
    return html`

      <vaadin-button @click="${this.onClick}">Test</vaadin-button>

<canvas id="screen1" width="512" height="512"></canvas>

<div id="overlay">
   <form name="controls">
    <paper-slider  id="brightness" step="0.0001" value="2.2" min="0" max="4"></paper-slider>
    <paper-slider  id="param1" step="0.1" value="2.5" min="0" max="10.0"></paper-slider>
    <label><input type="radio" name="displayMode" value="flame" checked="checked"> Flame</label>
    <label><input type="radio" name="displayMode" value="position"> Position</label>
    <label><input type="radio" name="displayMode" value="colour"> Colour</label>
  </form>
</div>


`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add(
      'flex',
      'flex-col',
      'h-full',
      'items-center',
      'justify-center',
      'p-l',
      'text-center',
      'box-border'
    );
  }

  initFlag = false;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if(!this.initFlag) {
      this.initFlag = true;

      var brightnessElement = document.querySelector("#brightness") as HTMLElement;
      var param1Element = document.querySelector("#param1") as HTMLElement;
      var radioButtonElements = document.getElementsByName('displayMode') ;
      var canvas = document.getElementById("screen1")  as HTMLCanvasElement;



      FlamesEndpoint.getExampleFlame("example03").then( flame=> {
        const renderer = new FlameRenderer(canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
        renderer.drawScene()
      })

    }

  }

  onClick = ()=> {
    FlamesEndpoint.getExampleFlame("example01").then( f=> console.log("FLAME:",  FlameMapper.mapFromBackend(f)))
  }
}
