import {html, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import {TextFieldValueChangedEvent} from "@vaadin/text-field/src/vaadin-text-field";
import {HasValue} from "@vaadin/form";

@customElement('empty-view')
export class EmptyView extends View {
  @query("#canvas-container")
  canvasContainer!: HTMLDivElement;

  @property()
  flameName = 'example02'

  render() {

    return html`



      <div id="canvas-container">

        
        <canvasx id="screen1" width="512" height="512"></canvasx>
      </div>
<div id="overlay">
   <form name="controls">
     <vaadin-text-field value="${this.flameName}" @change="${(event: Event)=>this.flameName=(event.target as HasValue<string>).value!}"></vaadin-text-field>
     <vaadin-button @click="${this.onClick}">Render</vaadin-button>
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

  renderFlame(flameName: string) {
    this.canvasContainer.innerHTML = '';

    var brightnessElement = document.querySelector("#brightness") as HTMLElement;
    var param1Element = document.querySelector("#param1") as HTMLElement;
    var radioButtonElements = document.getElementsByName('displayMode') ;
    // var canvas = document.getElementById("screen1")  as HTMLCanvasElement;

    var canvas = document.createElement('canvas');

    canvas.id = "screen1";
    canvas.width = 512;
    canvas.height = 512;
    this.canvasContainer.appendChild(canvas);

    FlamesEndpoint.getExampleFlame(flameName).then( flame=> {
      const renderer = new FlameRenderer(canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
      renderer.drawScene()
    })
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if(!this.initFlag && this.canvasContainer) {
      this.initFlag = true;
      this.renderFlame(this.flameName)
    }

  }

  onClick = ()=> {
    this.renderFlame(this.flameName)
    //FlamesEndpoint.getExampleFlame("example04").then( f=> console.log("FLAME:",  FlameMapper.mapFromBackend(f)))
  }
}
