import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { EventMgr, EventName } from './common/scripts/manager/EventMgr';
const { ccclass, property } = _decorator;


@ccclass('Main')
export class Main extends Component {


    @property({ type: Prefab })
    private mapPrefab: Prefab;

    @property({ type: Prefab })
    private roadPrefab: Prefab;


    private _cNode: Node;

    private _viewNum: number;

    start() {


        EventMgr.on(EventName.ACH_RED, this.changeView, this);

        this._viewNum = 1;
        this.changeView();
    }



    private changeView() {
        const self = this;
        console.log("-----changeView----", self._viewNum);

        const cv = () => {
            let pre = self._viewNum == 1 ? self.mapPrefab : self.roadPrefab;
            self._cNode = instantiate(pre);
            self._cNode.parent = self.node;
            self._viewNum = self._viewNum == 1 ? 0 : 1;
        }

        if (self._cNode) {
            self._cNode.destroy();
            self._cNode = null;
            self.scheduleOnce(cv, 0);
        }
        else {
            cv();
        }

    }


}


