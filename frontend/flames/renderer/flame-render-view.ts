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

import {RenderFlame} from "Frontend/flames/model/render-flame";
import {EPSILON, M_PI} from "Frontend/flames/renderer/mathlib";

export class FlameRenderView {
    private _camX0 = 0.0
    private _camY0 = 0.0
    private _camX1 = 0.0
    private _camY1 = 0.0
    private _camW = 0.0
    private _camH = 0.0
    private _bws = 0.0
    private _bhs = 0.0
    private _cosa = 0.0
    private _sina = 0.0
    private _rcX = 0.0
    private _rcY = 0.0
    private _doProject3D = false
    private _useDOF = false
    private _legacyDOF = false
    private _area = 0.0
    private _fade = 0.0
    private _areaMinusFade = 0.0
    private _camDOF_10 = 0.0

    private _m: number[][] = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]

    private _borderWidth = 0
    private _rasterWidth = 0
    private _rasterHeight = 0

    constructor(private _flame: RenderFlame, private _imageWidth: number, private _imageHeight: number) {
       const oversample = 1
       const noiseFilterSize = 0.0
       this._borderWidth =  Math.max((noiseFilterSize - oversample), 0) / 2
       this._rasterWidth = oversample * this._imageWidth + 2 * this._borderWidth
       this._rasterHeight = oversample * this._imageHeight + 2 * this._borderWidth

        this.init3D()
        this.initView()
    }

    private init3D() {
        {
            const yaw = -this._flame.camYaw * M_PI / 180.0;
            const pitch = this._flame.camPitch * M_PI / 180.0;
            const roll = this._flame.camRoll * M_PI / 180.0;
            const bank = this._flame.camBank * M_PI / 180.0;
            this.createProjectionMatrix(yaw, pitch, bank, roll);
        }
        this._useDOF = this.isDOFActive();
        this._doProject3D = this.is3dProjectionRequired();
        this._legacyDOF = !this._flame.newCamDOF;
        this._camDOF_10 = 0.1 * this._flame.camDOF;
        this._area = this._flame.camDOFArea;
        this._fade = this._flame.camDOFArea / 2.25;
        this._areaMinusFade = this._area - this._fade;
    }

    private initView() {
        const pixelsPerUnit = this._flame.pixelsPerUnit * this._flame.camZoom;
        const corner_x = this._flame.centreX - this._imageWidth / pixelsPerUnit / 2.0;
        const corner_y = this._flame.centreY - this._imageHeight / pixelsPerUnit / 2.0;
        const border_size = this._borderWidth / pixelsPerUnit;

        this._camX0 = corner_x - border_size;
        this._camY0 = corner_y - border_size;
        this._camX1 = corner_x + this._imageWidth / pixelsPerUnit + border_size;
        this._camY1 = corner_y + this._imageHeight / pixelsPerUnit + border_size;

        this._camW = this._camX1 - this._camX0;
        this._camH = this._camY1 - this._camY0;

        this._bws = this._rasterWidth / this._camW / this._imageWidth;
        this._bhs = this._rasterHeight / this._camH / this._imageHeight;

        if (!this._doProject3D) {
            this._cosa = Math.cos(-M_PI * (this._flame.camRoll) / 180.0);
            this._sina = Math.sin(-M_PI * (this._flame.camRoll) / 180.0);
            this._rcX = this._flame.centreX * (1.0 - this._cosa) - this._flame.centreY * this._sina - this._camX0;
            this._rcY = this._flame.centreY * (1.0 - this._cosa) + this._flame.centreX * this._sina - this._camY0;
        } else {
            this._cosa = 1.0;
            this._sina = 0.0;
            this._rcX = -this._camX0;
            this._rcY = -this._camY0;
        }
    }

    private createProjectionMatrix(yaw: number, pitch: number, bank: number, roll: number) {
        this._m[0][0] = -Math.cos(pitch) * Math.sin(roll) * Math.sin(yaw) - (Math.sin(pitch) * Math.sin(bank) * Math.sin(roll) - Math.cos(bank) * Math.cos(roll)) * Math.cos(yaw);
        this._m[1][0] = -Math.cos(pitch) * Math.cos(yaw) * Math.sin(roll) + (Math.sin(pitch) * Math.sin(bank) * Math.sin(roll) - Math.cos(bank) * Math.cos(roll)) * Math.sin(yaw);
        this._m[2][0] = Math.cos(bank) * Math.sin(pitch) * Math.sin(roll) + Math.cos(roll) * Math.sin(bank);
        this._m[0][1] = Math.cos(pitch) * Math.cos(roll) * Math.sin(yaw) + (Math.cos(roll) * Math.sin(pitch) * Math.sin(bank) + Math.cos(bank) * Math.sin(roll)) * Math.cos(yaw);
        this._m[1][1] = Math.cos(pitch) * Math.cos(roll) * Math.cos(yaw) - (Math.cos(roll) * Math.sin(pitch) * Math.sin(bank) + Math.cos(bank) * Math.sin(roll)) * Math.sin(yaw);
        this._m[2][1] = -Math.cos(bank) * Math.cos(roll) * Math.sin(pitch) + Math.sin(bank) * Math.sin(roll);
        this._m[0][2] = -Math.cos(pitch) * Math.cos(yaw) * Math.sin(bank) + Math.sin(pitch) * Math.sin(yaw);
        this._m[1][2] = Math.cos(pitch) * Math.sin(bank) * Math.sin(yaw) + Math.cos(yaw) * Math.sin(pitch);
        this._m[2][2] = Math.cos(pitch) * Math.cos(bank);
    }

    private is3dProjectionRequired() {
        return Math.abs(this._flame.camYaw) > EPSILON || Math.abs(this._flame.camPitch) > EPSILON ||
            Math.abs(this._flame.camBank) > EPSILON || Math.abs(this._flame.camPerspective) > EPSILON ||
            this.isDOFActive() ||
            Math.abs(this._flame.diminishZ) > EPSILON || Math.abs(this._flame.camPosX) > EPSILON ||
            Math.abs(this._flame.camPosY) > EPSILON || Math.abs(this._flame.camPosZ) > EPSILON;
    }

    private isDOFActive() {
        return false // Math.abs(this._flame.camDOF) > EPSILON;
    }

    public get doProject3D() {
        return this._doProject3D
    }

    public get flame() {
        return this._flame
    }

    public get sina() {
        return this._sina
    }

    public get cosa(){
        return this._cosa
    }

    public get rcX() {
        return this._rcX
    }

    public get rcY() {
        return this._rcY
    }

    public get m() {
        return this._m
    }

    public get area() {
        return this._area
    }

    public get areaMinusFade() {
        return this._areaMinusFade
    }

    public get legacyDOF() {
        return this._legacyDOF
    }

    public get useDOF() {
        return this._useDOF
    }

    public get bws() {
        return this._bws
    }

    public get bhs() {
        return this._bhs
    }
}