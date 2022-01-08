import {html, PropertyValues} from 'lit';
import { customElement } from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'

import {main} from '../../flames/renderer/program'

@customElement('empty-view')
export class EmptyView extends View {
  render() {
    return html`

<style>
  html, body, p {
    margin: 0;
    padding: 0;
  }

  #overlay {
    position: absolute;
    right: 0;
    top: 0;
  }

  #overlay p {
    color: red;
  }
</style>

<canvas id="screen" width="1024" height="1024"></canvas>

<div id="overlay">

  
  <p id="fps-counter">60 fps</p>
  <form name="controls">
    <paper-slider  id="brightness" step="0.0001" value="2.2" min="0" max="4"></paper-slider>
    <paper-slider  id="param1" step="0.1" value="2.5" min="0" max="10.0"></paper-slider>


    <input id="brightness1" type="range" min="0" max="4" step="0.0001" value="2.2">
    <button onclick="save();return false;">Save</button>
    <br>

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
      var fpsCounterElement = document.getElementById("fps-counter") as HTMLElement;
      var canvas = document.getElementById("screen")  as HTMLCanvasElement;

      main(canvas, brightnessElement, radioButtonElements, fpsCounterElement, param1Element);
    }
  }

}
