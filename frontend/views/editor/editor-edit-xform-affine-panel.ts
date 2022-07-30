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
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/vaadin-tabs'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";

@localized()
@customElement('editor-edit-xform-affine-panel')
export class EditorEditXformAffinePanel extends EditPropertyPanel {
  private readonly EDITPLANE_XY = 0
  private readonly EDITPLANE_YZ = 1
  private readonly EDITPLANE_ZX = 2

  private readonly AFFINE_MIN_VALUE = -3
  private readonly AFFINE_MAX_VALUE = 3
  private readonly AFFINE_VALUE_STEP = 0.01

  private readonly AFFINE_ROT_MIN_VALUE = -360
  private readonly AFFINE_ROT_MAX_VALUE = 360
  private readonly AFFINE_ROT_VALUE_STEP = 3

  private readonly AFFINE_SCL_MIN_VALUE = -2
  private readonly AFFINE_SCL_MAX_VALUE = 2
  private readonly AFFINE_SCL_VALUE_STEP = 0.1

  private readonly LABEL_WIDTH = '2em'
  
  @state()
  selectedEditPlane = this.EDITPLANE_XY

  private xyC00: NumberFieldDescriptor = {
    key: 'xyC00', label: msg('C00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC00'),
    value: this.getXformValue.bind(this,'xyC00'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC00')
  }

  private xyC01: NumberFieldDescriptor = {
    key: 'xyC01', label: msg('C01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC01'),
    value: this.getXformValue.bind(this,'xyC01'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC01')
  }

  private xyC10: NumberFieldDescriptor = {
    key: 'xyC10', label: msg('C10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC10'),
    value: this.getXformValue.bind(this,'xyC10'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC10')
  }

  private xyC11: NumberFieldDescriptor = {
    key: 'xyC11', label: msg('C11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC11'),
    value: this.getXformValue.bind(this,'xyC11'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC11')
  }

  private xyC20: NumberFieldDescriptor = {
    key: 'xyC20', label: msg('C20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC20'),
    value: this.getXformValue.bind(this,'xyC20'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC20')
  }

  private xyC21: NumberFieldDescriptor = {
    key: 'xyC21', label: msg('C21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyC21'),
    value: this.getXformValue.bind(this,'xyC21'),
    onButtonClicked: this.xformKeyFrameClicked.bind(this, 'xyC21')
  }

  private xyCRotate: NumberFieldDescriptor = {
    key: 'xyCRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyCRotate'),
    value: this.getXformValue.bind(this,'xyCRotate')
  }

  private xyCScale: NumberFieldDescriptor = {
    key: 'xyCScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyCScale'),
    value: this.getXformValue.bind(this,'xyCScale')
  }

  private yzC00: NumberFieldDescriptor = {
    key: 'yzC00', label: msg('C00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC00'),
    value: this.getXformValue.bind(this,'yzC00')
  }

  private yzC01: NumberFieldDescriptor = {
    key: 'yzC01', label: msg('C01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC01'),
    value: this.getXformValue.bind(this,'yzC01')
  }

  private yzC10: NumberFieldDescriptor = {
    key: 'yzC10', label: msg('C10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC10'),
    value: this.getXformValue.bind(this,'yzC10')
  }

  private yzC11: NumberFieldDescriptor = {
    key: 'yzC11', label: msg('C11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC11'),
    value: this.getXformValue.bind(this,'yzC11')
  }

  private yzC20: NumberFieldDescriptor = {
    key: 'yzC20', label: msg('C20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC20'),
    value: this.getXformValue.bind(this,'yzC20')
  }

  private yzC21: NumberFieldDescriptor = {
    key: 'yzC21', label: msg('C21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzC21'),
    value: this.getXformValue.bind(this,'yzC21')
  }

  private yzCRotate: NumberFieldDescriptor = {
    key: 'yzCRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzCRotate'),
    value: this.getXformValue.bind(this,'yzCRotate')
  }

  private yzCScale: NumberFieldDescriptor = {
    key: 'yzCScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzCScale'),
    value: this.getXformValue.bind(this,'yzCScale')
  }

  private zxC00: NumberFieldDescriptor = {
    key: 'zxC00', label: msg('C00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC00'),
    value: this.getXformValue.bind(this,'zxC00')
  }

  private zxC01: NumberFieldDescriptor = {
    key: 'zxC01', label: msg('C01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC01'),
    value: this.getXformValue.bind(this,'zxC01')
  }

  private zxC10: NumberFieldDescriptor = {
    key: 'zxC10', label: msg('C10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC10'),
    value: this.getXformValue.bind(this,'zxC10')
  }

  private zxC11: NumberFieldDescriptor = {
    key: 'zxC11', label: msg('C11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC11'),
    value: this.getXformValue.bind(this,'zxC11')
  }

  private zxC20: NumberFieldDescriptor = {
    key: 'zxC20', label: msg('C20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC20'),
    value: this.getXformValue.bind(this,'zxC20')
  }

  private zxC21: NumberFieldDescriptor = {
    key: 'zxC21', label: msg('C21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxC21'),
    value: this.getXformValue.bind(this,'zxC21')
  }

  private zxCRotate: NumberFieldDescriptor = {
    key: 'zxCRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxCRotate'),
    value: this.getXformValue.bind(this,'zxCRotate')
  }

  private zxCScale: NumberFieldDescriptor = {
    key: 'zxCScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxCScale'),
    value: this.getXformValue.bind(this,'zxCScale')
  }

  private xyP00: NumberFieldDescriptor = {
    key: 'xyP00', label: msg('P00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP00'),
    value: this.getXformValue.bind(this,'xyP00')
  }

  private xyP01: NumberFieldDescriptor = {
    key: 'xyP01', label: msg('P01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP01'),
    value: this.getXformValue.bind(this,'xyP01')
  }

  private xyP10: NumberFieldDescriptor = {
    key: 'xyP10', label: msg('P10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP10'),
    value: this.getXformValue.bind(this,'xyP10')
  }

  private xyP11: NumberFieldDescriptor = {
    key: 'xyP11', label: msg('P11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP11'),
    value: this.getXformValue.bind(this,'xyP11')
  }

  private xyP20: NumberFieldDescriptor = {
    key: 'xyP20', label: msg('P20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP20'),
    value: this.getXformValue.bind(this,'xyP20')
  }

  private xyP21: NumberFieldDescriptor = {
    key: 'xyP21', label: msg('P21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyP21'),
    value: this.getXformValue.bind(this,'xyP21')
  }

  private xyPRotate: NumberFieldDescriptor = {
    key: 'xyPRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyPRotate'),
    value: this.getXformValue.bind(this,'xyPRotate')
  }

  private xyPScale: NumberFieldDescriptor = {
    key: 'xyPScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'xyPScale'),
    value: this.getXformValue.bind(this,'xyPScale')
  }

  private yzP00: NumberFieldDescriptor = {
    key: 'yzP00', label: msg('P00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP00'),
    value: this.getXformValue.bind(this,'yzP00')
  }

  private yzP01: NumberFieldDescriptor = {
    key: 'yzP01', label: msg('P01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP01'),
    value: this.getXformValue.bind(this,'yzP01')
  }

  private yzP10: NumberFieldDescriptor = {
    key: 'yzP10', label: msg('P10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP10'),
    value: this.getXformValue.bind(this,'yzP10')
  }

  private yzP11: NumberFieldDescriptor = {
    key: 'yzP11', label: msg('P11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP11'),
    value: this.getXformValue.bind(this,'yzP11')
  }

  private yzP20: NumberFieldDescriptor = {
    key: 'yzP20', label: msg('P20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP20'),
    value: this.getXformValue.bind(this,'yzP20')
  }

  private yzP21: NumberFieldDescriptor = {
    key: 'yzP21', label: msg('P21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzP21'),
    value: this.getXformValue.bind(this,'yzP21')
  }

  private yzPRotate: NumberFieldDescriptor = {
    key: 'yzPRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzPRotate'),
    value: this.getXformValue.bind(this,'yzPRotate')
  }

  private yzPScale: NumberFieldDescriptor = {
    key: 'yzPScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'yzPScale'),
    value: this.getXformValue.bind(this,'yzPScale')
  }

  private zxP00: NumberFieldDescriptor = {
    key: 'zxP00', label: msg('P00'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP00'),
    value: this.getXformValue.bind(this,'zxP00')
  }

  private zxP01: NumberFieldDescriptor = {
    key: 'zxP01', label: msg('P01'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP01'),
    value: this.getXformValue.bind(this,'zxP01')
  }

  private zxP10: NumberFieldDescriptor = {
    key: 'zxP10', label: msg('P10'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP10'),
    value: this.getXformValue.bind(this,'zxP10')
  }

  private zxP11: NumberFieldDescriptor = {
    key: 'zxP11', label: msg('P11'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP11'),
    value: this.getXformValue.bind(this,'zxP11')
  }

  private zxP20: NumberFieldDescriptor = {
    key: 'zxP20', label: msg('P20'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP20'),
    value: this.getXformValue.bind(this,'zxP20')
  }

  private zxP21: NumberFieldDescriptor = {
    key: 'zxP21', label: msg('P21'), min: this.AFFINE_MIN_VALUE, max: this.AFFINE_MAX_VALUE, step: this.AFFINE_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxP21'),
    value: this.getXformValue.bind(this,'zxP21')
  }

  private zxPRotate: NumberFieldDescriptor = {
    key: 'zxPRotate', label: msg('Rot'), min: this.AFFINE_ROT_MIN_VALUE, max: this.AFFINE_ROT_MAX_VALUE, step: this.AFFINE_ROT_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxPRotate'),
    value: this.getXformValue.bind(this,'zxPRotate')
  }

  private zxPScale: NumberFieldDescriptor = {
    key: 'zxPScale', label: msg('Scl'), min: this.AFFINE_SCL_MIN_VALUE, max: this.AFFINE_SCL_MAX_VALUE, step: this.AFFINE_SCL_VALUE_STEP,
    labelWidth: this.LABEL_WIDTH,
    onChange: this.xformPropertyChange.bind(this,'zxPScale'),
    value: this.getXformValue.bind(this,'zxPScale')
  }

  renderControls() {
    return html`
      <vaadin-vertical-layout>  
        <vaadin-tabs  @selected-changed="${this.editPlaneTabChanged}">
            <vaadin-tab>${msg('XY-plane')}</vaadin-tab>
            <vaadin-tab>${msg('YZ-plane')}</vaadin-tab>
            <vaadin-tab>${msg('ZX-plane')}</vaadin-tab>
        </vaadin-tabs>

        <div style="${this.selectedEditPlane === this.EDITPLANE_XY ? `display:block;`: `display:none;`}">
          <vaadin-horizontal-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModeAffine() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">  
              ${this.renderNumberField(this.xyC00)}
              ${this.renderNumberField(this.xyC01)}
              ${this.renderNumberField(this.xyC10)}
              ${this.renderNumberField(this.xyC11)}
              ${this.renderNumberField(this.xyC20)}
              ${this.renderNumberField(this.xyC21)}
              ${this.renderNumberField(this.xyCRotate)}
              ${this.renderNumberField(this.xyCScale)}
            </vaadin-vertical-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModePost() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">  
              ${this.renderNumberField(this.xyP00)}
              ${this.renderNumberField(this.xyP01)}
              ${this.renderNumberField(this.xyP10)}
              ${this.renderNumberField(this.xyP11)}
              ${this.renderNumberField(this.xyP20)}
              ${this.renderNumberField(this.xyP21)}
              ${this.renderNumberField(this.xyPRotate)}
              ${this.renderNumberField(this.xyPScale)}
            </vaadin-vertical-layout>
          </vaadin-horizontal-layout>
        </div>
        <div style="${this.selectedEditPlane === this.EDITPLANE_YZ ? `display:block;`: `display:none;`}">
          <vaadin-horizontal-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModeAffine() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">
              ${this.renderNumberField(this.yzC00)}
              ${this.renderNumberField(this.yzC01)}
              ${this.renderNumberField(this.yzC10)}
              ${this.renderNumberField(this.yzC11)}
              ${this.renderNumberField(this.yzC20)}
              ${this.renderNumberField(this.yzC21)}
              ${this.renderNumberField(this.yzCRotate)}
              ${this.renderNumberField(this.yzCScale)}
            </vaadin-vertical-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModePost() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">
              ${this.renderNumberField(this.yzP00)}
              ${this.renderNumberField(this.yzP01)}
              ${this.renderNumberField(this.yzP10)}
              ${this.renderNumberField(this.yzP11)}
              ${this.renderNumberField(this.yzP20)}
              ${this.renderNumberField(this.yzP21)}
              ${this.renderNumberField(this.yzPRotate)}
              ${this.renderNumberField(this.yzPScale)}
          </vaadin-vertical-layout>
          </vaadin-horizontal-layout>
        </div>
        <div style="${this.selectedEditPlane === this.EDITPLANE_ZX ? `display:block;`: `display:none;`}">
          <vaadin-horizontal-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModeAffine() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">
              ${this.renderNumberField(this.zxC00)}
              ${this.renderNumberField(this.zxC01)}
              ${this.renderNumberField(this.zxC10)}
              ${this.renderNumberField(this.zxC11)}
              ${this.renderNumberField(this.zxC20)}
              ${this.renderNumberField(this.zxC21)}
              ${this.renderNumberField(this.zxCRotate)}
              ${this.renderNumberField(this.zxCScale)}
            </vaadin-vertical-layout>
            <vaadin-vertical-layout style="${editorStore.isEditModePost() || editorStore.isEditModeAffinePost() ? `display:block;`: `display:none;`}">
              ${this.renderNumberField(this.zxP00)}
              ${this.renderNumberField(this.zxP01)}
              ${this.renderNumberField(this.zxP10)}
              ${this.renderNumberField(this.zxP11)}
              ${this.renderNumberField(this.zxP20)}
              ${this.renderNumberField(this.zxP21)}
              ${this.renderNumberField(this.zxPRotate)}
              ${this.renderNumberField(this.zxPScale)}
            </vaadin-vertical-layout>
          </vaadin-horizontal-layout>
        </div>
      </vaadin-vertical-layout>     
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties)
    this.registerControl(this.xyC00)
    this.registerControl(this.xyC01)
    this.registerControl(this.xyC10)
    this.registerControl(this.xyC11)
    this.registerControl(this.xyC20)
    this.registerControl(this.xyC21)
    this.registerControl(this.xyCRotate)
    this.registerControl(this.xyCScale)
    this.registerControl(this.xyP00)
    this.registerControl(this.xyP01)
    this.registerControl(this.xyP10)
    this.registerControl(this.xyP11)
    this.registerControl(this.xyP20)
    this.registerControl(this.xyP21)
    this.registerControl(this.xyPRotate)
    this.registerControl(this.xyPScale)

    this.registerControl(this.yzC00)
    this.registerControl(this.yzC01)
    this.registerControl(this.yzC10)
    this.registerControl(this.yzC11)
    this.registerControl(this.yzC20)
    this.registerControl(this.yzC21)
    this.registerControl(this.yzCRotate)
    this.registerControl(this.yzCScale)
    this.registerControl(this.yzP00)
    this.registerControl(this.yzP01)
    this.registerControl(this.yzP10)
    this.registerControl(this.yzP11)
    this.registerControl(this.yzP20)
    this.registerControl(this.yzP21)
    this.registerControl(this.yzPRotate)
    this.registerControl(this.yzPScale)

    this.registerControl(this.zxC00)
    this.registerControl(this.zxC01)
    this.registerControl(this.zxC10)
    this.registerControl(this.zxC11)
    this.registerControl(this.zxC20)
    this.registerControl(this.zxC21)
    this.registerControl(this.zxCRotate)
    this.registerControl(this.zxCScale)
    this.registerControl(this.zxP00)
    this.registerControl(this.zxP01)
    this.registerControl(this.zxP10)
    this.registerControl(this.zxP11)
    this.registerControl(this.zxP20)
    this.registerControl(this.zxP21)
    this.registerControl(this.zxPRotate)
    this.registerControl(this.zxPScale)
    this.updateControlReferences(true)
  }

  editPlaneTabChanged(e: CustomEvent) {
    this.selectedEditPlane = e.detail.value;
  }


}

