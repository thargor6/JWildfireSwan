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

import {html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/vaadin-tabs'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-edit-xform-affine-panel')
export class EditorEditXformAffinePanel extends EditPropertyPanel {
  private readonly EDITPLANE_XY = 0
  private readonly EDITPLANE_YZ = 1
  private readonly EDITPLANE_ZX = 2

  private readonly AFFINE_MIN_VALUE = -3
  private readonly AFFINE_MAX_VALUE = 3
  private readonly AFFINE_VALUE_STEP = 0.01

  private readonly LABEL_WIDTH = '2em'
  
  @state()
  selectedEditPlane = this.EDITPLANE_XY


  private xyC00: NumberFieldDescriptor = {
    key: 'xyC00', label: msg('xyC00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC00'),
    value: this.getXformValue.bind(this,'xyC00')
  }

  private xyC01: NumberFieldDescriptor = {
    key: 'xyC01', label: msg('xyC01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC01'),
    value: this.getXformValue.bind(this,'xyC01')
  }

  private xyC10: NumberFieldDescriptor = {
    key: 'xyC10', label: msg('xyC10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC10'),
    value: this.getXformValue.bind(this,'xyC10')
  }

  private xyC11: NumberFieldDescriptor = {
    key: 'xyC11', label: msg('xyC11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC11'),
    value: this.getXformValue.bind(this,'xyC11')
  }

  private xyC20: NumberFieldDescriptor = {
    key: 'xyC20', label: msg('xyC20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC20'),
    value: this.getXformValue.bind(this,'xyC20')
  }

  private xyC21: NumberFieldDescriptor = {
    key: 'xyC21', label: msg('xyC21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC21'),
    value: this.getXformValue.bind(this,'xyC21')
  }

  private yzC00: NumberFieldDescriptor = {
    key: 'yzC00', label: msg('yzC00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC00'),
    value: this.getXformValue.bind(this,'yzC00')
  }

  private yzC01: NumberFieldDescriptor = {
    key: 'yzC01', label: msg('yzC01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC01'),
    value: this.getXformValue.bind(this,'yzC01')
  }

  private yzC10: NumberFieldDescriptor = {
    key: 'yzC10', label: msg('yzC10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC10'),
    value: this.getXformValue.bind(this,'yzC10')
  }

  private yzC11: NumberFieldDescriptor = {
    key: 'yzC11', label: msg('yzC11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC11'),
    value: this.getXformValue.bind(this,'yzC11')
  }

  private yzC20: NumberFieldDescriptor = {
    key: 'yzC20', label: msg('yzC20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC20'),
    value: this.getXformValue.bind(this,'yzC20')
  }

  private yzC21: NumberFieldDescriptor = {
    key: 'yzC21', label: msg('yzC21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC21'),
    value: this.getXformValue.bind(this,'yzC21')
  }

  private zxC00: NumberFieldDescriptor = {
    key: 'zxC00', label: msg('zxC00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC00'),
    value: this.getXformValue.bind(this,'zxC00')
  }

  private zxC01: NumberFieldDescriptor = {
    key: 'zxC01', label: msg('zxC01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC01'),
    value: this.getXformValue.bind(this,'zxC01')
  }

  private zxC10: NumberFieldDescriptor = {
    key: 'zxC10', label: msg('zxC10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC10'),
    value: this.getXformValue.bind(this,'zxC10')
  }

  private zxC11: NumberFieldDescriptor = {
    key: 'zxC11', label: msg('zxC11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC11'),
    value: this.getXformValue.bind(this,'zxC11')
  }

  private zxC20: NumberFieldDescriptor = {
    key: 'zxC20', label: msg('zxC20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC20'),
    value: this.getXformValue.bind(this,'zxC20')
  }

  private zxC21: NumberFieldDescriptor = {
    key: 'zxC21', label: msg('zxC21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC21'),
    value: this.getXformValue.bind(this,'zxC21')
  }

  renderControls() {
    return html`
        <vaadin-tabs  @selected-changed="${this.editPlaneTabChanged}">
            <vaadin-tab>${msg('XY-plane')}</vaadin-tab>
            <vaadin-tab>${msg('YZ-plane')}d</vaadin-tab>
            <vaadin-tab>${msg('ZX-plane')}</vaadin-tab>
        </vaadin-tabs>

        <div style="${this.selectedEditPlane === this.EDITPLANE_XY ? `display:block;`: `display:none;`}">
          ${this.renderNumberField(this.xyC00)}
          ${this.renderNumberField(this.xyC01)}
          ${this.renderNumberField(this.xyC10)}
          ${this.renderNumberField(this.xyC11)}
          ${this.renderNumberField(this.xyC20)}
          ${this.renderNumberField(this.xyC21)}
        </div>
        <div style="${this.selectedEditPlane === this.EDITPLANE_YZ ? `display:block;`: `display:none;`}">
          ${this.renderNumberField(this.yzC00)}
          ${this.renderNumberField(this.yzC01)}
          ${this.renderNumberField(this.yzC10)}
          ${this.renderNumberField(this.yzC11)}
          ${this.renderNumberField(this.yzC20)}
          ${this.renderNumberField(this.yzC21)}
        </div>
        <div style="${this.selectedEditPlane === this.EDITPLANE_ZX ? `display:block;`: `display:none;`}">
          ${this.renderNumberField(this.zxC00)}
          ${this.renderNumberField(this.zxC01)}
          ${this.renderNumberField(this.zxC10)}
          ${this.renderNumberField(this.zxC11)}
          ${this.renderNumberField(this.zxC20)}
          ${this.renderNumberField(this.zxC21)}
        </div>
    `;
  }

  editPlaneTabChanged(e: CustomEvent) {
    this.selectedEditPlane = e.detail.value;
  }

}

