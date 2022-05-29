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

import {RenderFlame, RenderLayer, RenderXForm} from "Frontend/flames/model/render-flame";
import {FlameRenderView} from "Frontend/flames/renderer/flame-render-view";
import {XFormPartShaderGenerator} from "Frontend/flames/renderer/shadergen/xform-gen";
import {DepFunctionsPartShaderGenerator} from "Frontend/flames/renderer/shadergen/dep-functions-gen";

export class ProgPointsVertexShaderGenerator {
    private xformGen = new XFormPartShaderGenerator();
    private depFuncGen = new DepFunctionsPartShaderGenerator()

    public createShader(flame: RenderFlame, layer: RenderLayer, canvas_size:number) {
        const view = new FlameRenderView(flame, canvas_size, canvas_size)

        return  `
        attribute vec3 aVertexPosition;
        
        uniform sampler2D uTexSamp_Points;
        uniform sampler2D uTexSamp_Colors;
        uniform sampler2D motionBlurTimeStamp;
        
        uniform float seed;            
        uniform float time;
                    
        varying vec4 fragColor;		
        
        ${this.depFuncGen.addStandardFunctions()}      
        ${this.depFuncGen.addDepFunctions(layer.finalXforms)}
        
        void main(void) {
            gl_PointSize = 1.0;
        
            vec2 tex = aVertexPosition.xy;
        
            vec3 point = texture2D(uTexSamp_Points, tex).rgb;
            vec4 color = texture2D(uTexSamp_Colors, tex);
            float lTime = texture2D(motionBlurTimeStamp, tex).x;
            
            fragColor = color;
            RNGState rngState = RNGState(rand0(tex));
            
            ${this.addFinalXForms(layer)}
            
            ${this.addCamera(view)}
        }
     `
    }

    addFinalXForms = (layer: RenderLayer) => {

        if(layer.finalXforms.length>0) {
            return `
               ${layer.finalXforms.map(xForm => this.xformGen.addFinalXForm(xForm)).join('')}  
             `;
        }
        else {
            return ''
        }
    }

    addCamera(view: FlameRenderView) {
        if (view.doProject3D) {
            return `             
            
          float _px = point.x;
          float _py = point.y;
          float _pz = point.z;  
          float _cx = float(${view.m[0][0]}) * _px + float(${view.m[1][0]}) * _py + float(${view.m[2][0]}) * _pz;
          float _cy = float(${view.m[0][1]}) * _px + float(${view.m[1][1]}) * _py + float(${view.m[2][1]}) * _pz;
          float _cz = float(${view.m[0][2]}) * _px + float(${view.m[1][2]}) * _py + float(${view.m[2][2]}) * _pz;
      
          _cx += float(${view.flame.camPosX});
          _cy += float(${view.flame.camPosY});
          _cz += float(${view.flame.camPosZ});

          float zr = 1.0 - float(${view.flame.camPerspective}) * _cz + float(${view.flame.camPosZ});
          if (zr < 1.0e-6) {
              zr = 1.0e-6;
          }
          
          float prjZ = _cz;
          float prjIntensity = 1.0;
          if (float(${view.flame.diminishZ}) > 1.0e-6) {
            float zdist = (float(${view.flame.dimZDistance}) - _cz);
            if (zdist > 0.0) {
                prjIntensity = exp(-zdist * zdist * float(${view.flame.diminishZ}));
            }
          }
        
          if (${view.useDOF}) {
            if (${view.legacyDOF}) {
              float zdist = float(${view.flame.camZ}) - _cz;
              if (zdist > 0.0) {
                  //    dofBlurShape.applyDOFAndCamera(camPoint, pPoint, zdist, zr);
              }
              else {
                 // dofBlurShape.applyOnlyCamera(camPoint, pPoint, zdist, zr);
              }
            }
            else {
               float xdist = (_cx - float(${view.flame.focusX}));
               float ydist = (_cy - float(${view.flame.focusY}));
               float zdist = (_cz - float(${view.flame.focusZ}));
    
               float dist = pow(xdist * xdist + ydist * ydist + zdist * zdist, 1.0 / float(${view.flame.camDOFExponent}));
               if (dist > float(${view.area})) {
                  //  dofBlurShape.applyDOFAndCamera(camPoint, pPoint, dist, zr);
               }
               else if (dist > float(${view.areaMinusFade})) {
                 // float scl = GfxMathLib.smootherstep(0.0, 1.0, (dist - areaMinusFade) / fade);
                 // float sclDist = scl * dist;
                 // dofBlurShape.applyDOFAndCamera(camPoint, pPoint, sclDist, zr);
               }
               else {
                  // dofBlurShape.applyOnlyCamera(camPoint, pPoint, zdist, zr);
               }
            }
          }  
          else {
            _px = _cx / zr;
            _py = _cy / zr;
          }
    
          float prjX = _px * float(${view.cosa}) + _py * float(${view.sina}) + float(${view.rcX});
          float prjY = _py * float(${view.cosa}) - _px * float(${view.sina}) + float(${view.rcY});
          gl_Position = vec4(prjX * float(${view.bws}), - prjY * float(${view.bhs}), 0.0, 1.0);
    `
        }
        else {
            return ` 
            float prjX = point.x * float(${view.cosa}) + point.y * float(${view.sina}) + float(${view.rcX});
            float prjY = point.y * float(${view.cosa}) - point.x * float(${view.sina}) + float(${view.rcY});
            gl_Position = vec4(prjX * float(${view.bws}), -prjY * float(${view.bhs}), 0.0, 1.0);
        `
        }
    }
}

