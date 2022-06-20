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
@customElement('editor-edit-xform-xaos-panel')
export class EditorEditXformXaosPanel extends EditPropertyPanel {
  renderControls() {
    return html`
         Xaos
    `;
  }


}

