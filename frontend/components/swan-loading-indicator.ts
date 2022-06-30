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

import {customElement, property} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {css, html, nothing} from "lit";

@customElement('swan-loading-indicator')
export class SwanLoadingIndicator extends MobxLitElement {
    @property()
    loading = true

    @property()
    caption = 'Loading...'

    // Loading indicator taken from: https://loading.io/css/
    static get styles() {
        return css `
            .lds-ellipsis {
              display: inline-block;
              position: relative;
              width: 80px;
              height: 80px;
            }
            .lds-ellipsis div {
              position: absolute;
              top: 33px;
              width: 13px;
              height: 13px;
              border-radius: 50%;
              background: #EB8F05;
              animation-timing-function: cubic-bezier(0, 1, 1, 0);
            }
            .lds-ellipsis div:nth-child(1) {
              left: 8px;
              animation: lds-ellipsis1 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(2) {
              left: 8px;
              animation: lds-ellipsis2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(3) {
              left: 32px;
              animation: lds-ellipsis2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(4) {
              left: 56px;
              animation: lds-ellipsis3 0.6s infinite;
            }
            @keyframes lds-ellipsis1 {
              0% {
                transform: scale(0);
              }
              100% {
                transform: scale(1);
              }
            }
            @keyframes lds-ellipsis3 {
              0% {
                transform: scale(1);
              }
              100% {
                transform: scale(0);
              }
            }
            @keyframes lds-ellipsis2 {
              0% {
                transform: translate(0, 0);
              }
              100% {
                transform: translate(24px, 0);
              }
            }
        `
    }

    render() {
        return  this.loading ? html  `<div class="lds-ellipsis">${this.caption}<div></div><div></div><div></div><div></div></div>` : nothing
    }
}