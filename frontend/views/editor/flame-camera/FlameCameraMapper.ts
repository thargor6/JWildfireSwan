import {Flame} from "Frontend/flames/model/flame";
import {FlameCameraModel} from "Frontend/views/editor/flame-camera/FlameCameraModel";

export class FlameCameraMapper {

  public static mapFromFlame(source: Flame, dest: FlameCameraModel) {
    dest.camRoll = source.camRoll.value
    dest.camPitch = source.camPitch.value
    dest.camYaw = source.camYaw.value
    dest.camBank = source.camBank.value
    dest.camPerspective = source.camPerspective.value
    dest.centreX = source.centreX.value
    dest.centreY = source.centreY.value
    dest.camZoom = source.camZoom.value
  }

  public static mapToFlame(source: FlameCameraModel, dest: Flame) {
    dest.camRoll.value = source.camRoll
    dest.camPitch.value = source.camPitch
    dest.camYaw.value = source.camYaw
    dest.camBank.value = source.camBank
    dest.camPerspective.value = source.camPerspective
    dest.centreX.value = source.centreX
    dest.centreY.value = source.centreY
    dest.camZoom.value = source.camZoom
  }

}
