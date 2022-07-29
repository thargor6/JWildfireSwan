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

import {html, PropertyValues} from 'lit';
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {customElement, property} from 'lit/decorators.js';
import {localized, msg} from "@lit/localize";
import '../../components/swan-number-slider'
import {MobxLitElement} from "@adobe/lit-mobx";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-anim-frame-panel')
export class EditorAnimFramePanel extends EditPropertyPanel {

  @property()
  reRender = () => {}

  @property()
  playAnimation = ()=>{}

  private frame: NumberFieldDescriptor = {
    key: 'frame', label: msg('Frame'), min: 0, max: 100, step: 1,
    onChange: this.flamePropertyChange.bind(this,'frame'),
    labelWidth: '5em', sliderWidth: '30em', hideEditField: true,
    value: this.getFlameValue.bind(this,'frame')
  }

  private frameCount: NumberFieldDescriptor = {
    key: 'frameCount', label: msg('Frame count'), min: 3, max: 100, step: 10,
    onChange: this.flamePropertyChange.bind(this,'frameCount'),
    hideSlider: true, labelWidth: '7em',
    value: this.getFlameValue.bind(this,'frameCount')
  }

  renderControls() {
    return html`
        <div style="display: flex;flex-direction: row;">
        ${this.renderNumberField(this.frame)}
        ${this.renderNumberField(this.frameCount)}
        <vaadin-button style="margin-left: 1em;" @click="${this.playAnimation}">${msg('Play')}</vaadin-button>    
        </div>
    `
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties)
    this.registerControl(this.frame)
    this.registerControl(this.frameCount)
    this.updateControlReferences(true)
  }


}

