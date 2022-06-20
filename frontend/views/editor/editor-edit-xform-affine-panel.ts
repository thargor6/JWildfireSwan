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
import {customElement} from 'lit/decorators.js';
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-edit-xform-affine-panel')
export class EditorEditXformAffinePanel extends EditPropertyPanel {

  private xyC00: NumberFieldDescriptor = {
    key: 'xyC00', label: msg('xyC00'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC00'),
    value: this.getXformValue.bind(this,'xyC00')
  }

  private xyC01: NumberFieldDescriptor = {
    key: 'xyC01', label: msg('xyC01'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC01'),
    value: this.getXformValue.bind(this,'xyC01')
  }

  private xyC10: NumberFieldDescriptor = {
    key: 'xyC10', label: msg('xyC10'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC10'),
    value: this.getXformValue.bind(this,'xyC10')
  }

  private xyC11: NumberFieldDescriptor = {
    key: 'xyC11', label: msg('xyC11'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC11'),
    value: this.getXformValue.bind(this,'xyC11')
  }

  private xyC20: NumberFieldDescriptor = {
    key: 'xyC20', label: msg('xyC20'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC20'),
    value: this.getXformValue.bind(this,'xyC20')
  }

  private xyC21: NumberFieldDescriptor = {
    key: 'xyC21', label: msg('xyC21'), min: -3, max: 3, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'xyC21'),
    value: this.getXformValue.bind(this,'xyC21')
  }

  renderControls() {
    return html`
        ${this.renderNumberField(this.xyC00)}
        ${this.renderNumberField(this.xyC01)}
        ${this.renderNumberField(this.xyC10)}
        ${this.renderNumberField(this.xyC11)}
        ${this.renderNumberField(this.xyC20)}
        ${this.renderNumberField(this.xyC21)}
    `;
  }


}

