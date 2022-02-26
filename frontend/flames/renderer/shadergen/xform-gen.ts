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
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";

export class XFormPartShaderGenerator {

  addXForm(xForm: RenderXForm, xFormIdx: number) {
    return `if(xFormIdx==${xFormIdx}) {
               _vx = _vy = 0.0;
               ${this.addAffineTx(xForm)}
               float _phi = atan2(_tx, _ty);
               float _r2 = _tx * _tx + _ty * _ty;
               float _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;    
               
               _color = _color * float(${xForm.c1}) + float(${xForm.c2});   
               ${this.hasPreVariations(xForm) ? `
                 ${this.addVariations(xForm, -1)}    
                 _phi = atan2(_tx, _ty);
                 _r2 = _tx * _tx + _ty * _ty;
                 _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;
                 `
      : '' }     
               ${this.addVariations(xForm, 0)}
               ${this.addVariations(xForm, 1)}
               ${this.addPostAffineTx(xForm)}
		       if(_color<0.0) {
				 _color = 0.0;
			   }
			   else if(_color>1.0 - 1.0e-06) {
				 _color = 1.0 - 1.0e-06; 
			   }
			}	
	`;
  }

  addFinalXForm(xForm: RenderXForm) {
    return `{
           float _tx = _px; 
           float _ty = _py; 
           float _tz = _pz; 
           float _vx = 0.0;
           float _vy = 0.0;
           float _vz = 0.0;
           ${this.addAffineTx(xForm)}
           float _phi = atan2(_tx, _ty);
           float _r2 = _tx * _tx + _ty * _ty;
           float _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;    
           float _color = 0.0;   
           ${this.hasPreVariations(xForm) ? `
               ${this.addVariations(xForm, -1)}    
                 _phi = atan2(_tx, _ty);
                 _r2 = _tx * _tx + _ty * _ty;
                 _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;
                 `
               : '' }     
           ${this.addVariations(xForm, 0)}
           ${this.addVariations(xForm, 1)}
           ${this.addPostAffineTx(xForm)}
           
           _px = _vx;
           _py = _vy;
           _pz = _vz;
  }	
`;
  }

  addVariation(xform: RenderXForm, variation: RenderVariation) {
    return VariationShaders.getVariationCode(xform, variation)
  }

  addVariations(xform: RenderXForm, priority: number) {
    return `{
          ${xform.variations.filter(variation => VariationShaders.getVariationPriority(variation)===priority).map(variation => this.addVariation(xform, variation)).join('')}
          }`
  }

  hasPreVariations(xform: RenderXForm) {
    return xform.variations.filter(variation => VariationShaders.getVariationPriority(variation)===-1).length > 0;
  }

  addAffineTx(xForm: RenderXForm) {
    if (xForm.c00 != 1.0 || xForm.c01 != 0.0 || xForm.c11 != 1.0 || xForm.c10 != 0.0 || xForm.c20 != 0.0 || xForm.c21 != 0.0) {
      return `
              _tx = float(${xForm.c00}) * point.x + float(${xForm.c10}) * point.y + float(${xForm.c20});
              _ty = float(${xForm.c01}) * point.x + float(${xForm.c11}) * point.y + float(${xForm.c21});
        `
    } else {
      return `
             _tx = point.x;
             _ty = point.y;
         `
    }
  }

  addPostAffineTx(xForm: RenderXForm) {
    if (xForm.p00 != 1.0 || xForm.p01 != 0.0 || xForm.p11 != 1.0 || xForm.p10 != 0.0 || xForm.p20 != 0.0 || xForm.p21 != 0.0) {
      return `
               float _px = float(${xForm.p00}) * _vx + float(${xForm.p10}) * _vy + float(${xForm.p20});
               float _py = float(${xForm.p01}) * _vx + float(${xForm.p11}) * _vy + float(${xForm.p21});
               _vx = _px;
               _vy = _py;
        `
    } else {
      return ``
    }
  }

}