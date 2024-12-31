import { _decorator, Component, EventTouch, Graphics, Layers, Node, UITransform, Vec2, Widget } from 'cc';
import { GameMgr } from '../common/scripts/manager/GameMgr';
import { Sprite } from 'cc';
import { Color } from 'cc';
import { ScrollView } from 'cc';
import { BOX_SIZE, GData } from './GData';
import { EventMgr, EventName } from '../common/scripts/manager/EventMgr';
const { ccclass, property } = _decorator;



@ccclass('SetMap')
export class SetMap extends Component {

    @property({ type: ScrollView })
    private SView: ScrollView;

    @property({ type: Node })
    private mParent: Node;

    @property({ type: Node })
    private mapImg: Node;

    @property({ type: Sprite })
    private barImg: Sprite;



    /**初始滚动容器滚动偏移y*/
    private _initSY: number;

    /**横行 格子总数*/
    private _widthNum: number;
    /**高度 格子总数*/
    private _heightNum: number;

    /**编辑类型 0=取消，1=添加，2=减少*/
    private _editT: number;

    /**拖拽节点*/
    private dragNode: Node;

    /**辅导线图形类*/
    private gridGraphics: Graphics;
    private gridUit: UITransform;

    /**红色障碍物节点当前存在的字典*/
    private _oObj: { [id: number]: Node };

    /**红色障碍物节点对象池*/
    private _oPool: Node[];


    start() {

        this.mParent.getComponent(UITransform).contentSize = this.mapImg.getComponent(UITransform).contentSize;

        this.drawLine();

        this.scheduleOnce(() => {
            this._initSY = Math.floor(this.SView.getScrollOffset().y);
            console.log("========", this.SView.getScrollOffset())
        }, 0)
    }


    protected onDestroy(): void {
        this.dragRemoveEvent();
    }


    private createDragNode() {
        const self = this;
        if (!self.dragNode) {
            self.dragNode = GameMgr.createNode(self.mapImg, "dragNode");
            const utf = self.dragNode.getComponent(UITransform);
            utf.contentSize = self.mapImg.getComponent(UITransform).contentSize;
            utf.setAnchorPoint(0, 0);
        }
        if (!self.dragNode.hasEventListener(Node.EventType.TOUCH_START)) {
            self.dragEvent();
        }
    }

    private dragEvent() {
        const self = this;
        if (self.dragNode) {
            self.dragNode.on(Node.EventType.TOUCH_START, self.onTouchStart, self);
            self.dragNode.on(Node.EventType.TOUCH_MOVE, self.onTouchMove, self);
            self.dragNode.on(Node.EventType.TOUCH_END, self.onTouchEnd, self);
            self.dragNode.on(Node.EventType.TOUCH_CANCEL, self.onTouchEnd, self);
        }
    }


    private dragRemoveEvent() {
        // const self = this;
        // if (self.dragNode && self.dragNode.hasEventListener(Node.EventType.TOUCH_START)) {
        //     self.dragNode.off(Node.EventType.TOUCH_START, self.onTouchStart, self);
        //     self.dragNode.off(Node.EventType.TOUCH_MOVE, self.onTouchMove, self);
        //     self.dragNode.off(Node.EventType.TOUCH_END, self.onTouchEnd, self);
        //     self.dragNode.off(Node.EventType.TOUCH_CANCEL, self.onTouchEnd, self);
        //     self.dragNode.destroy();
        //     self.dragNode = null;
        // }
    }

    private onTouchStart(event: EventTouch) { }

    private onTouchMove(event: EventTouch) {
        const location = event.getUILocation();
        // const screenPos = new Vec3(location.x, location.y, 0);
        // console.log(this._editT, "-拖拽------", location, this.SView.getScrollOffset())

        let posX = location.x + Math.abs(this.SView.getScrollOffset().x);
        let posY = (location.y - BOX_SIZE * 1.5) + Math.abs(this.SView.getScrollOffset().y - this._initSY);
        let bx = Math.floor(posX / BOX_SIZE);
        let by = Math.floor(posY / BOX_SIZE);
        let oid = bx + by * this._widthNum;
        // console.log(this._editT, this._initSY, "-拖拽------", location, this.SView.getScrollOffset(), "==", oid, bx, by, posX, posY);

        if (!this._oObj) {
            this._oObj = {};
        }
        if (!this._oPool) {
            this._oPool = [];
        }


        if (this._editT == 1) {
            if (!this._oObj[oid]) {
                let item = this._oPool.shift();
                if (!item) {
                    let img = GameMgr.createImg(this.mapImg, "imgBox");
                    img.spriteFrame = this.barImg.spriteFrame;
                    img.color = new Color().fromHEX("#FF0000A6");
                    // img.color = Color.RED;
                    img.type = Sprite.Type.SLICED;
                    item = img.node;
                    item.getComponent(UITransform).setContentSize(50, 50);
                }
                item.active = true;
                item.setPosition((bx + 0.5) * BOX_SIZE, (by + 0.5) * BOX_SIZE);
                this._oObj[oid] = item;
                console.log("新增一个", oid, bx, by, posX, posY, item.position)
            }
        }
        else {
            if (this._oObj[oid]) {
                this._oObj[oid].active = false;
                this._oPool.push(this._oObj[oid]);
                delete this._oObj[oid];
                console.log("减少一个", oid, bx, by, posX, posY)
            }
        }

    }

    private onTouchEnd() { }


    public setDargFinish() {
    }


    private drawLine() {
        if (!this.gridGraphics) {
            //创建图形对象
            const gNode = new Node();
            gNode.layer = Layers.Enum.UI_2D;
            gNode.parent = this.mapImg.parent;

            const widget = gNode.addComponent(Widget);
            widget.left = 0;
            widget.bottom = 0;

            this.gridUit = gNode.addComponent(UITransform);
            this.gridUit.setAnchorPoint(0, 0);

            this.gridGraphics = gNode.addComponent(Graphics);
            this.gridGraphics.lineWidth = 2;
        }

        // 获取画布大小
        const canvasSize = this.gridUit.contentSize = this.mapImg.getComponent(UITransform).contentSize;

        // 定义格子大小
        // const GRID_SIZE = new Vec2(canvasSize.width / 50, canvasSize.height / 50);

        this._widthNum = canvasSize.width / BOX_SIZE;
        this._heightNum = canvasSize.height / BOX_SIZE;
        // 绘制格子线段
        for (let i = 0; i <= this._widthNum; i++) {
            const x = i * BOX_SIZE;
            this.drawSegment(this.gridGraphics, new Vec2(x, 0), new Vec2(x, canvasSize.height));
        }

        for (let j = 0; j <= this._heightNum; j++) {
            const y = j * BOX_SIZE;
            this.drawSegment(this.gridGraphics, new Vec2(0, y), new Vec2(canvasSize.width, y));
        }
    }

    private drawSegment(gridGraphics: Graphics, startPoint: Vec2, endPoint: Vec2) {
        gridGraphics.moveTo(startPoint.x, startPoint.y);
        gridGraphics.lineTo(endPoint.x, endPoint.y);
        gridGraphics.stroke();
    }


    private clickSave() {
        console.log("-clickSave------------")
        GData.MapData = [];
        if (this._oObj && this._heightNum && this._widthNum) {
            for (let indexH = 0; indexH < this._heightNum; indexH++) {
                const lineN = indexH * this._widthNum;
                const lineArr: number[] = [];
                for (let indexW = 0; indexW < this._widthNum; indexW++) {
                    const oid = indexW + lineN;
                    if (this._oObj[oid]) {
                        lineArr.push(1);
                    }
                    else {
                        lineArr.push(0);
                    }
                }
                GData.MapData.push(lineArr);
            }
            console.log("-clickSave--------- GData.MapData---", GData.MapData);

        }
        EventMgr.emit(EventName.ACH_RED);
    }

    private clickAdd() {
        console.log("-clickAdd------------")
        this._editT = 1;
        this.changeBtn();
    }

    private clickClean() {
        console.log("-clickClean------------")
        this._editT = 2;
        this.changeBtn();
    }

    private clickCancle() {
        console.log("-clickCancle------------")
        this._editT = 0;
        this.changeBtn();
    }


    private changeBtn() {
        this.createDragNode();
        let barC = Color.WHITE;
        let drag = false;
        if (this._editT > 0) {
            drag = true;
            if (this._editT == 1) {
                barC = Color.RED;
            }
            else {
                barC = Color.BLUE;
            }
        }

        this.barImg.color = barC;
        this.dragNode.active = drag;
        this.SView.horizontal = !drag;
        this.SView.vertical = !drag;
    }





}


