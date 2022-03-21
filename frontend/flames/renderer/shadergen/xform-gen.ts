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
    if (!xForm.xyC00.equals(1.0) || !xForm.xyC01.equals(0.0) || !xForm.xyC11.equals(1.0) || !xForm.xyC10.equals(0.0) || !xForm.xyC20.equals(0.0) || !xForm.xyC21.equals(0.0)) {
      return `
              _tx = ${xForm.xyC00.toWebGl()} * point.x + ${xForm.xyC10.toWebGl()} * point.y + ${xForm.xyC20.toWebGl()};
              _ty = ${xForm.xyC01.toWebGl()} * point.x + ${xForm.xyC11.toWebGl()} * point.y + ${xForm.xyC21.toWebGl()};
        `
    } else {
      return `
             _tx = point.x;
             _ty = point.y;
         `
    }
  }

  addPostAffineTx(xForm: RenderXForm) {
    if (!xForm.xyP00.equals(1.0) || !xForm.xyP01.equals(0.0) || !xForm.xyP11.equals(1.0) || !xForm.xyP10.equals(0.0) || !xForm.xyP20.equals(0.0) || !xForm.xyP21.equals(0.0)) {
      return `
               float _px = ${xForm.xyP00.toWebGl()} * _vx + ${xForm.xyP10.toWebGl()} * _vy + ${xForm.xyP20.toWebGl()};
               float _py = ${xForm.xyP01.toWebGl()} * _vx + ${xForm.xyP11.toWebGl()} * _vy + ${xForm.xyP21.toWebGl()};
               _vx = _px;
               _vy = _py;
        `
    } else {
      return ``
    }
  }

}