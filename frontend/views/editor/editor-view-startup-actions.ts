import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {editorStore} from "Frontend/stores/editor-store";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {StartupAction} from "Frontend/stores/editor-startup-actions";
import {EditorView} from "Frontend/views/editor/editor-view";
import {renderInfoStore} from "Frontend/stores/render-info-store";

export class LoadExampleFlameAction implements StartupAction {
  private executed = false

  constructor(private view: EditorView, private exampleName: string) {
    //
  }

  execute(): boolean {
    if(!this.executed) {
      FlamesEndpoint.getExampleFlame(this.exampleName).then(flame => {
        editorStore.refreshing = true
        try {
          this.view.currFlame = FlameMapper.mapFromBackend(flame)
          this.view.reRender()
          renderInfoStore.calculating = false
        }
        finally {
          editorStore.refreshing = false
        }
      }).catch(err=>{
        console.log(`Error loading example flame ${this.exampleName}: ${err}`)
      })
      this.executed = true
      return true
    }
    else {
      return false
    }
  }
}
