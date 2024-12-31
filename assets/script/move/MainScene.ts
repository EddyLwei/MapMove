
import { _decorator, Color, Component, EventTouch, input, Input, KeyCode, Node, Sprite, UITransform, Vec2, Widget } from 'cc';
import { GameCamera } from './GameCamera';
import { EventMgr, EventName } from '../../common/scripts/manager/EventMgr';
import { GameMgr } from '../../common/scripts/manager/GameMgr';
import { BOX_SIZE, GData } from '../GData';

const { ccclass, property } = _decorator;

/**
 * 摄像机跟随Demo
 * @author chenkai 2022.8.29  https://www.cnblogs.com/gamedaybyday/p/16636851.html
 */
@ccclass
export default class MainScene extends Component {

    /**摇杆*/
    @property({ type: Node })
    private joystick: Node;


    /**地图节点*/
    @property({ type: Node })
    private mapNode: Node;

    /**人物节点*/
    @property({ type: Node })
    private roleNode: Node;

    /**视口*/
    @property({ type: Node })
    private viewPort: Node;


    /**摄像机 */
    private gameCamera: GameCamera;
    /**按键缓存 */
    private keyCache = {};
    /**人物移动速度 */
    private roleSpeed: number = 10;


    private _mapWidth2: number;
    private _mapHeight2: number;
    private _roleWidth2: number;
    private _roleHeight2: number;

    /**存在障碍物的格子编号列表*/
    private _obstacle: number[];

    /**横行格子总数*/
    private _widthNum: number;

    /**摇杆记录开始点位*/
    private _jPos: Vec2;

    start() {

        this.onTouchEnd();
        this.node.getComponent(Widget).updateAlignment();

        this.gameCamera = new GameCamera(this.viewPort, this.mapNode, this.roleNode);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this._mapWidth2 = this.mapNode.getComponent(UITransform).width / 2;
        this._mapHeight2 = this.mapNode.getComponent(UITransform).height / 2;
        this._roleWidth2 = this.roleNode.getComponent(UITransform).width / 2;
        this._roleHeight2 = this.roleNode.getComponent(UITransform).height / 2;
        console.log("--onLoad-------", this._mapWidth2, this._mapHeight2, this._roleWidth2, this._roleHeight2)

        this.dragEvent();

        this.createObstacle();
    }




    protected onDestroy(): void {
        this.dragRemoveEvent();
    }



    protected dragEvent() {
        const self = this;
        self.node.on(Node.EventType.TOUCH_START, self.onTouchStart, self);
        self.node.on(Node.EventType.TOUCH_MOVE, self.onTouchMove, self);
        self.node.on(Node.EventType.TOUCH_END, self.onTouchEnd, self);
        self.node.on(Node.EventType.TOUCH_CANCEL, self.onTouchEnd, self);
    }


    protected dragRemoveEvent() {
        const self = this;
        self.node.off(Node.EventType.TOUCH_START, self.onTouchStart, self);
        self.node.off(Node.EventType.TOUCH_MOVE, self.onTouchMove, self);
        self.node.off(Node.EventType.TOUCH_END, self.onTouchEnd, self);
        self.node.off(Node.EventType.TOUCH_CANCEL, self.onTouchEnd, self);
    }


    protected onTouchStart(event: EventTouch) {
        this.joystick.parent.active = true;
        this._jPos = event.getUILocation();
        this.joystick.parent.setPosition(this._jPos.x - this._mapWidth2 + 85, this._jPos.y - 35);
    }

    protected onTouchMove(event: EventTouch) {
        const tPos = event.getUILocation();

        const moveX = tPos.x - this._jPos.x;
        let mLeft = false;
        let mRight = false;
        if (moveX > 50) {
            mRight = true;
        }
        else if (moveX < -50) {
            mLeft = true;
        }
        if (this.keyCache[KeyCode.ARROW_RIGHT] != mRight) {
            this.keyCache[KeyCode.ARROW_RIGHT] = mRight;
        }
        if (this.keyCache[KeyCode.ARROW_LEFT] != mLeft) {
            this.keyCache[KeyCode.ARROW_LEFT] = mLeft;
        }

        const moveY = tPos.y - this._jPos.y;
        let mDown = false;
        let mUp = false;
        if (moveY > 50) {
            mUp = true;
        }
        else if (moveY < -50) {
            mDown = true;
        }
        if (this.keyCache[KeyCode.ARROW_UP] != mUp) {
            this.keyCache[KeyCode.ARROW_UP] = mUp;
        }
        if (this.keyCache[KeyCode.ARROW_DOWN] != mDown) {
            this.keyCache[KeyCode.ARROW_DOWN] = mDown;
        }

        let jpx = mLeft ? -50 : mRight ? 50 : 0;
        let jpy = mDown ? -50 : mUp ? 50 : 0;
        // let jpx = event.getLocation().x > 50 ? 50 : event.getLocation().x;
        // jpx = jpx < -50 ? -50 : jpx;
        // let jpy = event.getLocation().y > 50 ? 50 : event.getLocation().y;
        // jpy = jpy < -50 ? -50 : jpy;
        this.joystick.setPosition(jpx, jpy);
    }

    protected onTouchEnd() {
        this.joystick.parent.active = false;
        this.keyCache[KeyCode.ARROW_UP] = false;
        this.keyCache[KeyCode.ARROW_DOWN] = false;
        this.keyCache[KeyCode.ARROW_LEFT] = false;
        this.keyCache[KeyCode.ARROW_RIGHT] = false;

        this.joystick.setPosition(0, 0);
        // this.joystick.parent.setPosition(-530, 65);
    }



    update(dt) {
        if (!this._mapWidth2 || !this._mapHeight2 || !this._roleWidth2 || !this._roleHeight2) {
            return;
        }
        this.updateRoleMove();
        this.updateCamera();
    }



    private clickChange() {
        EventMgr.emit(EventName.ACH_RED);
    }

    /**刷新人物移动 */
    private updateRoleMove() {
        // const oldPos: number[] = [this.roleNode.position.x, this.roleNode.position.y];

        if (this.keyCache[KeyCode.ARROW_UP] || this.keyCache[KeyCode.ARROW_DOWN] || this.keyCache[KeyCode.ARROW_LEFT] || this.keyCache[KeyCode.ARROW_RIGHT]) {

            let posX;
            let posY;
            const rPos = this.roleNode.position;

            let checkX: number;
            let checkY: number;
            // let box2 = BOX_SIZE / 2;
            let box2 = 0
            if (this.keyCache[KeyCode.ARROW_LEFT]) {
                posX = rPos.x - this.roleSpeed;
                checkX = posX - this._roleWidth2 - box2;
            }
            else if (this.keyCache[KeyCode.ARROW_RIGHT]) {
                posX = rPos.x + this.roleSpeed;
                checkX = posX + this._roleWidth2 + box2;
            }
            //检测x障碍物
            if (typeof (checkX) == "number" && this.checkObs(checkX, rPos.y)) {
                posX = null;
            }

            //根据按键移动
            if (this.keyCache[KeyCode.ARROW_UP]) {
                posY = rPos.y + this.roleSpeed;
                checkY = posY + this._roleHeight2 + box2;
            }
            else if (this.keyCache[KeyCode.ARROW_DOWN]) {
                posY = rPos.y - this.roleSpeed;
                checkY = posY - this._roleHeight2 - box2;
            }
            //检测y障碍物
            if (typeof (checkY) == "number" && this.checkObs(rPos.x, checkY)) {
                posY = null;
            }


            if (typeof (posX) == "number" || typeof (posY) == "number") {
                if (typeof (posX) != "number") {
                    posX = rPos.x;
                }
                if (typeof (posY) != "number") {
                    posY = rPos.y;
                }

                //边缘检测
                if (posX + this._roleWidth2 > this._mapWidth2) {
                    posX = this._mapWidth2 - this._roleWidth2;
                    console.log("人物超过地图右边缘");
                }
                else if (posX - this._roleWidth2 < -this._mapWidth2) {
                    posX = this._roleWidth2 - this._mapWidth2;
                    console.log("人物超过地图左边缘");
                }

                if (posY + this._roleHeight2 > this._mapHeight2) {
                    posY = this._mapHeight2 - this._roleHeight2;
                    console.log("人物超过地图上边缘");
                }
                else if (posY - this._roleHeight2 < -this._mapHeight2) {
                    posY = -this._mapHeight2 + this._roleHeight2;
                    console.log("人物超过地图下边缘");
                }


                this.roleNode.setPosition(posX, posY);
            }
        }
    }

    /**检测障碍物*/
    private checkObs(posX: number, posY: number) {
        let bx = Math.floor((posX + this._mapWidth2) / BOX_SIZE);
        let by = Math.floor((posY + this._mapHeight2) / BOX_SIZE);
        let oid = bx + by * this._widthNum;
        if (this._obstacle.indexOf(oid) >= 0) {
            console.log(posX, posY, this._widthNum, "检测存在障碍物", bx, by, oid);
            return true;
        }
        return false;
    }

    private updateCamera() {
        this.gameCamera.updatePosition();
    }

    /**按下键*/
    public onKeyDown(event) {
        this.keyChange(event.keyCode, true);
    }

    /**松开按键*/
    public onKeyUp(event) {
        this.keyChange(event.keyCode, false);
    }

    /**按钮变化*/
    private keyChange(key, down: boolean) {
        if (key) {
            if (key == KeyCode.ARROW_UP || key == KeyCode.KEY_W) {
                this.keyCache[KeyCode.ARROW_UP] = down;
                console.log("按钮Up", down);
            }
            else if (key == KeyCode.ARROW_DOWN || key == KeyCode.KEY_S) {
                this.keyCache[KeyCode.ARROW_DOWN] = down;
                console.log("按钮Down", down);
            }
            else if (key == KeyCode.ARROW_LEFT || key == KeyCode.KEY_A) {
                this.keyCache[KeyCode.ARROW_LEFT] = down;
                console.log("按钮Left", down);
            }
            else if (key == KeyCode.ARROW_RIGHT || key == KeyCode.KEY_D) {
                this.keyCache[KeyCode.ARROW_RIGHT] = down;
                console.log("按钮right", down);
            }
        }
    }



    private createObstacle() {
        this._obstacle = [];
        if (GData.MapData) {
            for (let indexL = 0; indexL < GData.MapData.length; indexL++) {
                const lineArr = GData.MapData[indexL];
                if (!this._widthNum) {
                    this._widthNum = lineArr.length;
                }
                for (let indexB = 0; indexB < lineArr.length; indexB++) {
                    if (lineArr[indexB]) {
                        let img = GameMgr.createImg(this.mapNode, "imgBox");
                        img.spriteFrame = this.roleNode.getComponent(Sprite).spriteFrame;
                        img.color = new Color().fromHEX("#FF0000A6");
                        img.type = Sprite.Type.SLICED;
                        let item = img.node;
                        item.getComponent(UITransform).setContentSize(50, 50);
                        item.active = true;
                        item.setPosition((indexB + 0.5) * BOX_SIZE - this._mapWidth2, (indexL + 0.5) * BOX_SIZE - this._mapHeight2);
                        // console.log("-----obstacleGrid-------", this.obstacleGrid)
                        this._obstacle.push(indexB + indexL * this._widthNum);
                        console.log("obstacleGrid新增一个", indexB, indexL, item.position, this._obstacle)
                    }
                }
            }
        }
    }


}
