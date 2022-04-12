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
    let xyTx = ''
    if(!xForm.xyCRotate.equals(0.0) || !xForm.xyCScale.equals(1.0)) {
      xyTx =  `
              float alpha = ${xForm.xyCRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.xyCScale.toWebGl()};
              float c00 = ${xForm.xyC00.toWebGl()};
              float c10 = ${xForm.xyC10.toWebGl()};
              float c01 = ${xForm.xyC01.toWebGl()}; 
              float c11 = ${xForm.xyC11.toWebGl()};
              _tx = ((c00*cosa + c01*sina) * point.x + (c10*cosa + c11*sina) * point.y) * scale;
              _ty = ((-c00*sina + c01*cosa) * point.x + (-c10*sina + c11*cosa) * point.y) * scale;
        `
    }
    else if (!xForm.xyC00.equals(1.0) || !xForm.xyC01.equals(0.0) ||
        !xForm.xyC11.equals(1.0) || !xForm.xyC10.equals(0.0)) {
      xyTx =  `
              _tx = ${xForm.xyC00.toWebGl()} * point.x + ${xForm.xyC10.toWebGl()} * point.y;
              _ty = ${xForm.xyC01.toWebGl()} * point.x + ${xForm.xyC11.toWebGl()} * point.y;
        `
    } else {
      xyTx = `
             _tx = point.x;
             _ty = point.y;
         `
    }

    let yzTx = ''
    if(!xForm.yzCRotate.equals(0.0) || !xForm.yzCScale.equals(1.0)) {
      yzTx =  `
              float alpha = ${xForm.yzCRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.yzCScale.toWebGl()};
              float c00 = ${xForm.yzC00.toWebGl()};
              float c10 = ${xForm.yzC10.toWebGl()};
              float c01 = ${xForm.yzC01.toWebGl()}; 
              float c11 = ${xForm.yzC11.toWebGl()};
              float _ny = (c00*cosa + c01*sina) * _ty + (c10*cosa + c11*sina) * _tz;
              float _nz = (-c00*sina + c01*cosa) * _ty + (-c10*sina + c11*cosa) * _tz;
              _ty = _ny;
              _tz = _nz;
        `
    }
    else if (!xForm.yzC00.equals(1.0) || !xForm.yzC01.equals(0.0) ||
        !xForm.yzC11.equals(1.0) || !xForm.yzC10.equals(0.0)) {
      yzTx = `
        {
          float _ny = ${xForm.yzC00.toWebGl()} * _ty + ${xForm.yzC10.toWebGl()} * _tz;
          float _nz = ${xForm.yzC01.toWebGl()} * _ty + ${xForm.yzC11.toWebGl()} * _tz;
          _ty = _ny;
          _tz = _nz;
        }
        `
    }

    let zxTx = ''
    if(!xForm.zxCRotate.equals(0.0) || !xForm.zxCScale.equals(1.0)) {
      zxTx =  `
              float alpha = ${xForm.zxCRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.zxCScale.toWebGl()};
              float c00 = ${xForm.zxC00.toWebGl()};
              float c10 = ${xForm.zxC10.toWebGl()};
              float c01 = ${xForm.zxC01.toWebGl()}; 
              float c11 = ${xForm.zxC11.toWebGl()};
              float _nx = (c00*cosa + c01*sina) * _tx + (c10*cosa + c11*sina) * _tz;
              float _nz = (-c00*sina + c01*cosa) * _tx + (-c10*sina + c11*cosa) * _tz;
              _tx = _nx;
              _tz = _nz;
          `
    }
    else if (!xForm.zxC00.equals(1.0) || !xForm.zxC01.equals(0.0) ||
        !xForm.zxC11.equals(1.0) || !xForm.zxC10.equals(0.0)) {
      zxTx = `
        {
          float _nx = ${xForm.yzC00.toWebGl()} * _tx + ${xForm.yzC10.toWebGl()} * _tz;
          float _nz = ${xForm.yzC01.toWebGl()} * _tx + ${xForm.yzC11.toWebGl()} * _tz;
          _tx = _nx;
          _tz = _nz;
        }
        `
    }
    return `
      {
        ${xyTx}
      } 
      {
        ${yzTx}
      }  
      {
        ${zxTx}
      }  
      _tx += ${xForm.xyC20.toWebGl()} + ${xForm.zxC20.toWebGl()};
      _ty += ${xForm.xyC21.toWebGl()} + ${xForm.yzC20.toWebGl()};
      _tz += ${xForm.yzC21.toWebGl()} + ${xForm.zxC21.toWebGl()};    
    `
  }

  addPostAffineTx(xForm: RenderXForm) {
    let xyTx = ''
    if(!xForm.xyPRotate.equals(0.0) || !xForm.xyPScale.equals(1.0)) {
      xyTx =  `
              float alpha = ${xForm.xyPRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.xyPScale.toWebGl()};
              float c00 = ${xForm.xyP00.toWebGl()};
              float c10 = ${xForm.xyP10.toWebGl()};
              float c01 = ${xForm.xyP01.toWebGl()}; 
              float c11 = ${xForm.xyP11.toWebGl()};
              float _px = (c00*cosa + c01*sina) * _vx + (c10*cosa + c11*sina) * _vy;
              float _py = (-c00*sina + c01*cosa) * _vx + (-c10*sina + c11*cosa) * _vy;
              _vx = _px;
              _vy = _py;
        `
    }
    else if (!xForm.xyP00.equals(1.0) || !xForm.xyP01.equals(0.0) ||
        !xForm.xyP11.equals(1.0) || !xForm.xyP10.equals(0.0)) {
      xyTx =  `
        {
           float _px = ${xForm.xyP00.toWebGl()} * _vx + ${xForm.xyP10.toWebGl()} * _vy;
           float _py = ${xForm.xyP01.toWebGl()} * _vx + ${xForm.xyP11.toWebGl()} * _vy;
           _vx = _px;
           _vy = _py;
        }      
        `
    }

    let yzTx = ''
    if(!xForm.yzPRotate.equals(0.0) || !xForm.yzPScale.equals(1.0)) {
      yzTx =  `
              float alpha = ${xForm.yzPRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.yzPScale.toWebGl()};
              float c00 = ${xForm.yzP00.toWebGl()};
              float c10 = ${xForm.yzP10.toWebGl()};
              float c01 = ${xForm.yzP01.toWebGl()}; 
              float c11 = ${xForm.yzP11.toWebGl()};
              float _py = (c00*cosa + c01*sina) * _vy + (c10*cosa + c11*sina) * _vz;
              float _pz = (-c00*sina + c01*cosa) * _vy + (-c10*sina + c11*cosa) * _vz;
              _ty = _py;
              _tz = _pz;
        `
    }
    else if (!xForm.yzP00.equals(1.0) || !xForm.yzP01.equals(0.0) ||
        !xForm.yzP11.equals(1.0) || !xForm.yzP10.equals(0.0)) {
      yzTx = `
        {
          float _py = ${xForm.yzP00.toWebGl()} * _vy + ${xForm.yzP10.toWebGl()} * _vz;
          float _pz = ${xForm.yzP01.toWebGl()} * _vy + ${xForm.yzP11.toWebGl()} * _vz;
          _ty = _py;
          _tz = _pz;
        }
        `
    }

    let zxTx = ''
    if(!xForm.zxPRotate.equals(0.0) || !xForm.zxPScale.equals(1.0)) {
      zxTx =  `
              float alpha = ${xForm.zxPRotate.toWebGl()} * M_PI / 180.0;
              float sina = sin(alpha);
              float cosa = cos(alpha);
              float scale = ${xForm.zxPScale.toWebGl()};
              float c00 = ${xForm.zxP00.toWebGl()};
              float c10 = ${xForm.zxP10.toWebGl()};
              float c01 = ${xForm.zxP01.toWebGl()}; 
              float c11 = ${xForm.zxP11.toWebGl()};
              float _px = (c00*cosa + c01*sina) * _vx + (c10*cosa + c11*sina) * _vz;
              float _pz = (-c00*sina + c01*cosa) * _vx + (-c10*sina + c11*cosa) * _vz;
              _tx = _px;
              _tz = _pz;
        `
    }
    else if (!xForm.zxP00.equals(1.0) || !xForm.zxP01.equals(0.0) ||
        !xForm.zxP11.equals(1.0) || !xForm.zxP10.equals(0.0)) {
      zxTx = `
        {
          float _px = ${xForm.yzP00.toWebGl()} * _vx + ${xForm.yzP10.toWebGl()} * _vz;
          float _pz = ${xForm.yzP01.toWebGl()} * _vx + ${xForm.yzP11.toWebGl()} * _vz;
          _tx = _px;
          _tz = _pz;
        }
        `
    }
    return `
      {
        ${xyTx}
      }
      {   
        ${yzTx}
      }  
      {
        ${zxTx}
      }  
      _vx += ${xForm.xyP20.toWebGl()} + ${xForm.zxP20.toWebGl()};
      _vy += ${xForm.xyP21.toWebGl()} + ${xForm.yzP20.toWebGl()};
      _vz += ${xForm.yzP21.toWebGl()} + ${xForm.zxP21.toWebGl()};    
    `
  }

}