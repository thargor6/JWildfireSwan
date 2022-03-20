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
           float _tx = 0.0; 
           float _ty = 0.0; 
           float _tz = point.z; 
           ${this.addAffineTx(xForm)}
           float _vx = 0.0;
           float _vy = 0.0;
           float _vz = 0.0;
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
           
           point.x = _vx;
           point.y = _vy;
           point.z = _vz;
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
    if (!xForm.c00.equals(1.0) || !xForm.c01.equals(0.0) || !xForm.c11.equals(1.0) || !xForm.c10.equals(0.0) || !xForm.c20.equals(0.0) || !xForm.c21.equals(0.0)) {
      return `
              _tx = ${xForm.c00.toWebGl()} * point.x + ${xForm.c10.toWebGl()} * point.y + ${xForm.c20.toWebGl()};
              _ty = ${xForm.c01.toWebGl()} * point.x + ${xForm.c11.toWebGl()} * point.y + ${xForm.c21.toWebGl()};
        `
    } else {
      return `
             _tx = point.x;
             _ty = point.y;
         `
    }
  }

  addPostAffineTx(xForm: RenderXForm) {
    if (!xForm.p00.equals(1.0) || !xForm.p01.equals(0.0) || !xForm.p11.equals(1.0) || !xForm.p10.equals(0.0) || !xForm.p20.equals(0.0) || !xForm.p21.equals(0.0)) {
      return `
               float _px = ${xForm.p00.toWebGl()} * _vx + ${xForm.p10.toWebGl()} * _vy + ${xForm.p20.toWebGl()};
               float _py = ${xForm.p01.toWebGl()} * _vx + ${xForm.p11.toWebGl()} * _vy + ${xForm.p21.toWebGl()};
               _vx = _px;
               _vy = _py;
        `
    } else {
      return ``
    }
  }

}