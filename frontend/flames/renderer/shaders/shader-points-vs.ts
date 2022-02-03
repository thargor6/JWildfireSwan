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

/**
  Vertex shader for point iteration.
  This is just an example for demonstration/understanding, it is not used in the actual application.
  It is taken from the code originally created by Richard Assar ( https://github.com/richardassar/ElectricSheep_WebGL )
 */
export const shader_points_vs = `
attribute vec3 aVertexPosition;

uniform sampler2D uTexSamp_Points;
uniform sampler2D uTexSamp_Colors;
			
uniform float time;
			
varying vec4 fragColor;		

void main(void) {
    gl_PointSize = 1.0;

    vec2 tex = aVertexPosition.xy;

    vec2 point = texture2D(uTexSamp_Points, tex).rgb;
    vec4 color = texture2D(uTexSamp_Colors, tex);

    fragColor = color;

    gl_Position = vec4(point.x, point.y, point.z, 1.0);
}
`;