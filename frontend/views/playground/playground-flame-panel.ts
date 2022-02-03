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
import {customElement, property, state} from 'lit/decorators.js';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-details'
import '@vaadin/vaadin-combo-box';
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";
import {HasValue} from "@vaadin/form";

@customElement('playground-flame-panel')
export class PlaygroundFlamePanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  flameXml = `<flame name="Sierpinsky - 1343704368" smooth_gradient="0" version="JWildfire V7.20 (05.11.2021)" size="512 512" center="0.0 0.0" scale="115.66013071895425" rotate="-45.0" filter="0.75" filter_type="GLOBAL_SHARPENING" filter_kernel="MITCHELL_SMOOTH" filter_indicator="0" filter_sharpness="4.0" filter_low_density="0.025" oversample="1" ai_post_denoiser="NONE" ai_post_denoiser_only_for_cpu="1" post_optix_denoiser_blend="0.11111" quality="25.0" background_type="GRADIENT_2X2_C" background_ul="0.0 0.0 0.0" background_ur="0.0 0.0 0.0" background_ll="0.0 0.0 0.0" background_lr="0.0 0.0 0.0" background_cc="0.0 0.0 0.0" bg_transparency="0" fg_opacity="1.0" brightness="4.0" saturation="1.0" gamma="4.0" gamma_threshold="0.01" vibrancy="1.0" contrast="1.0" white_level="220.0" temporal_samples="1.0" cam_zoom="4.56" cam_pitch="0.0" cam_yaw="0.0" cam_roll="0.0" cam_persp="0.0" cam_xfocus="0.0" cam_yfocus="0.0" cam_zfocus="0.0" cam_pos_x="0.0" cam_pos_y="0.0" cam_pos_z="0.0" cam_zpos="0.0" cam_dof="0.0" cam_dof_area="0.5" cam_dof_exponent="2.0" low_density_brightness="0.24" balancing_red="1.0" balancing_green="1.0" balancing_blue="1.0" cam_dof_shape="BUBBLE" cam_dof_scale="1.0" cam_dof_rotate="0.0" cam_dof_fade="1.0" antialias_amount="0.251" antialias_radius="0.51" post_symmetry_type="NONE" post_symmetry_order="3" post_symmetry_centre_x="0.0" post_symmetry_centre_y="0.0" post_symmetry_distance="1.25" post_symmetry_rotation="6.0" frame="1" frame_count="100" fps="25" post_blur_radius="0" post_blur_fade="0.95" post_blur_falloff="2.0" zbuffer_scale="1.0" zbuffer_bias="0.0" zbuffer_shift="0.0" zbuffer_filename="POST_DEPTH" mixer_mode="OFF" grad_edit_hue_curve_enabled="false" grad_edit_hue_curve_view_xmin="-5" grad_edit_hue_curve_view_xmax="260" grad_edit_hue_curve_view_ymin="-5.0" grad_edit_hue_curve_view_ymax="260.0" grad_edit_hue_curve_interpolation="SPLINE" grad_edit_hue_curve_selected_idx="0" grad_edit_hue_curve_locked="false" grad_edit_hue_curve_point_count="12" grad_edit_hue_curve_x0="0" grad_edit_hue_curve_y0="60.11513157894737" grad_edit_hue_curve_x1="23" grad_edit_hue_curve_y1="60.11513157894737" grad_edit_hue_curve_x2="46" grad_edit_hue_curve_y2="69.65277777777777" grad_edit_hue_curve_x3="70" grad_edit_hue_curve_y3="255.0" grad_edit_hue_curve_x4="93" grad_edit_hue_curve_y4="255.0" grad_edit_hue_curve_x5="116" grad_edit_hue_curve_y5="183.82936507936506" grad_edit_hue_curve_x6="139" grad_edit_hue_curve_y6="189.28846153846155" grad_edit_hue_curve_x7="162" grad_edit_hue_curve_y7="189.28846153846155" grad_edit_hue_curve_x8="185" grad_edit_hue_curve_y8="181.59090909090907" grad_edit_hue_curve_x9="209" grad_edit_hue_curve_y9="14.166666666666679" grad_edit_hue_curve_x10="232" grad_edit_hue_curve_y10="14.166666666666679" grad_edit_hue_curve_x11="255" grad_edit_hue_curve_y11="1.9615384615384641" grad_edit_saturation_curve_enabled="false" grad_edit_saturation_curve_view_xmin="-5" grad_edit_saturation_curve_view_xmax="260" grad_edit_saturation_curve_view_ymin="-5.0" grad_edit_saturation_curve_view_ymax="260.0" grad_edit_saturation_curve_interpolation="SPLINE" grad_edit_saturation_curve_selected_idx="0" grad_edit_saturation_curve_locked="false" grad_edit_saturation_curve_point_count="12" grad_edit_saturation_curve_x0="0" grad_edit_saturation_curve_y0="248.46153846153848" grad_edit_saturation_curve_x1="23" grad_edit_saturation_curve_y1="248.46153846153848" grad_edit_saturation_curve_x2="46" grad_edit_saturation_curve_y2="248.10810810810813" grad_edit_saturation_curve_x3="70" grad_edit_saturation_curve_y3="255.0" grad_edit_saturation_curve_x4="93" grad_edit_saturation_curve_y4="255.0" grad_edit_saturation_curve_x5="116" grad_edit_saturation_curve_y5="247.1538461538462" grad_edit_saturation_curve_x6="139" grad_edit_saturation_curve_y6="247.38805970149258" grad_edit_saturation_curve_x7="162" grad_edit_saturation_curve_y7="247.38805970149258" grad_edit_saturation_curve_x8="185" grad_edit_saturation_curve_y8="246.59340659340663" grad_edit_saturation_curve_x9="209" grad_edit_saturation_curve_y9="248.3766233766234" grad_edit_saturation_curve_x10="232" grad_edit_saturation_curve_y10="248.3766233766234" grad_edit_saturation_curve_x11="255" grad_edit_saturation_curve_y11="247.38805970149258" grad_edit_luminosity_curve_enabled="false" grad_edit_luminosity_curve_view_xmin="-5" grad_edit_luminosity_curve_view_xmax="260" grad_edit_luminosity_curve_view_ymin="-5.0" grad_edit_luminosity_curve_view_ymax="260.0" grad_edit_luminosity_curve_interpolation="SPLINE" grad_edit_luminosity_curve_selected_idx="0" grad_edit_luminosity_curve_locked="false" grad_edit_luminosity_curve_point_count="12" grad_edit_luminosity_curve_x0="0" grad_edit_luminosity_curve_y0="177.0" grad_edit_luminosity_curve_x1="23" grad_edit_luminosity_curve_y1="177.0" grad_edit_luminosity_curve_x2="46" grad_edit_luminosity_curve_y2="181.0" grad_edit_luminosity_curve_x3="70" grad_edit_luminosity_curve_y3="0.5" grad_edit_luminosity_curve_x4="93" grad_edit_luminosity_curve_y4="0.5" grad_edit_luminosity_curve_x5="116" grad_edit_luminosity_curve_y5="190.0" grad_edit_luminosity_curve_x6="139" grad_edit_luminosity_curve_y6="188.0" grad_edit_luminosity_curve_x7="162" grad_edit_luminosity_curve_y7="188.0" grad_edit_luminosity_curve_x8="185" grad_edit_luminosity_curve_y8="90.99999999999999" grad_edit_luminosity_curve_x9="209" grad_edit_luminosity_curve_y9="216.5" grad_edit_luminosity_curve_x10="232" grad_edit_luminosity_curve_y10="216.5" grad_edit_luminosity_curve_x11="255" grad_edit_luminosity_curve_y11="67.0">
  <xform weight="0.5" color_type="DIFFUSION" color="0.6042733824388847" symmetry="0.647173757077445" material="0.0" material_speed="0.0" mod_gamma="0.0" mod_gamma_speed="0.0" mod_contrast="0.0" mod_contrast_speed="0.0" mod_saturation="0.0" mod_saturation_speed="0.0" mod_hue="0.0" mod_hue_speed="0.0" linear3D="0.5" linear3D_fx_priority="0" coefs="1.0 0.0 0.0 1.0 -0.5 -0.5" chaos="1.0 1.0 1.0 1.0"/>
  <xform weight="0.5" color_type="DIFFUSION" color="0.9253709910471822" symmetry="0.757959725850013" material="0.0" material_speed="0.0" mod_gamma="0.0" mod_gamma_speed="0.0" mod_contrast="0.0" mod_contrast_speed="0.0" mod_saturation="0.0" mod_saturation_speed="0.0" mod_hue="0.0" mod_hue_speed="0.0" linear="0.5" linear_fx_priority="0" coefs="1.0 0.0 0.0 1.0 0.5 -0.5" chaos="1.0 1.0 1.0 1.0"/>
  <xform weight="0.5" color_type="DIFFUSION" color="0.7690197681803157" symmetry="0.24583108971947443" material="0.0" material_speed="0.0" mod_gamma="0.0" mod_gamma_speed="0.0" mod_contrast="0.0" mod_contrast_speed="0.0" mod_saturation="0.0" mod_saturation_speed="0.0" mod_hue="0.0" mod_hue_speed="0.0" linear3D="0.5" linear3D_fx_priority="0" coefs="1.0 0.0 0.0 1.0 0.5 0.5" chaos="1.0 1.0 1.0 1.0"/>
  <xform weight="0.5" color_type="DIFFUSION" color="0.06434345257200769" symmetry="0.4025364959021931" material="0.0" material_speed="0.0" mod_gamma="0.0" mod_gamma_speed="0.0" mod_contrast="0.0" mod_contrast_speed="0.0" mod_saturation="0.0" mod_saturation_speed="0.0" mod_hue="0.0" mod_hue_speed="0.0" linear3D="0.08" linear3D_fx_priority="0" twintrian="0.38369914" twintrian_fx_priority="0" coefs="0.9347321639531071 -0.35535303807839036 0.3376030072949233 0.8880419069225641 -0.4701820248892477 0.41322654950033005" post="0.5789853110550665 0.8153379726116452 -0.8153379726116452 0.5789853110550665 0.0 0.0" chaos="1.0 1.0 1.0 1.0"/>
  <palette count="256" format="RGB">
BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65
BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65
BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65BEFD65A1FD6D
A1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6D
A1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6D
A1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6DA1FD6D010000010000
010000010000010000010000010000010000010000010000010000010000010000010000
010000010000010000010000010000010000010000010000010000010000010000010000
010000010000010000010000010000010000010000010000010000A87FFDA87FFDA87FFD
A87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFD
A87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFD
A87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDA87FFDB67BFDB67BFDB67BFD
B67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFD
B67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFD
B67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFDB67BFD3303B33303B33303B33303B3
3303B33303B33303B33303B33303B33303B33303B33303B33303B33303B33303B33303B3
3303B33303B33303B33303B33303B33303B33303B33303B33303B33303B33303B33303B3
3303B33303B33303B33303B33303B33303B33303B3FECCB3FECCB3FECCB3FECCB3FECCB3
FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3
FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3
FECCB3FECCB3FECCB3FECCB3FECCB3FECCB3840802840802840802840802840802840802
840802840802840802840802  </palette>
</flame>
  `

  @property()
  onImport: ()=>void = ()=> {}

  @property()
  onRandomFlame: ()=>void = ()=> {}

  @state()
  flameName = 'example08'

  flameNames = ['example01', 'example02', 'example03', 'example04', 'example05', 'example06',
    'example07', 'example08', 'example10', 'example11', 'example12', 'example14', 'example16',
    'example17', 'example20', 'example21', 'example22', 'example23', 'example24', 'example25']

  @property()
  onFlameNameChanged: ()=>void = ()=> {}


  render() {
    return html`
      <div style="${this.visible ? `display:block; width: 100%;`: `display:none;`}">
        <div style="display:flex; flex-direction: column;">
          <vaadin-combo-box label="Example flame" .items="${this.flameNames}" value="${this.flameName}"
                            @change="${(event: Event) => this.flameNameChanged(event)}"></vaadin-combo-box>
          <br>
           <vaadin-text-area style="max-width:100em; max-height: 16em; font-size: xx-small;" label="Flame xml" value="${this.flameXml}" @change="${(event: Event)=>this.flameXmlChanged(event)}"></vaadin-text-area>
          <vaadin-button @click="${this.onImport}">Import flame from xml</vaadin-button>
          <br>
          <vaadin-button theme="primary" @click="${this.onRandomFlame}">Generate random flame</vaadin-button>
          
        </div>
      </div>
`;
  }

  private flameXmlChanged(event: Event) {
    if((event.target as HasValue<string>).value) {
      this.flameXml = (event.target as HasValue<string>).value!
    }
  }

  private flameNameChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.flameName = (event.target as HasValue<string>).value!
      this.onFlameNameChanged()
    }
  }

  protected firstUpdated() {

    playgroundStore.notifyInit(this.tagName)
  }

}
