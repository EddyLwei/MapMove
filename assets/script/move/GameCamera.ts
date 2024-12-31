/**
 * 游戏摄像机
 * @author chenkai 2022.8.29  https://www.cnblogs.com/gamedaybyday/p/16636851.html
 */

import { _decorator, Node, UITransform } from 'cc';



export class GameCamera {
    /**地图节点 */
    private mapNode: Node;
    /**人物节点 */
    private roleNode: Node;

    /**地图x轴最大移动距离 */
    private xRange: number;
    /**地图y轴最大移动距离 */
    private yRange: number;
    /**上一次人物X位置 */
    private lastRoleX: number;
    /**上一次人物Y位置 */
    private lastRoleY: number;

    /**
     * 构造函数
     * @param viewPortNode 视口节点  例如屏幕大小720x1280
     * @param mapNode      地图节点  例如2000x2000
     * @param roleNode     人物节点 
     */
    public constructor(viewPortNode: Node, mapNode: Node, roleNode: Node) {
        //保存节点
        this.mapNode = mapNode;
        this.roleNode = roleNode;
        const viewUtf = viewPortNode.getComponent(UITransform);
        const mapUtf = mapNode.getComponent(UITransform);
        //计算x，y轴最大移动距离
        if (mapUtf.width > viewUtf.width) {
            this.xRange = (mapUtf.width - viewUtf.width) / 2;
        } else {
            this.xRange = 0;
        }
        if (mapUtf.height > viewUtf.height) {
            this.yRange = (mapUtf.height - viewUtf.height) / 2;
        } else {
            this.yRange = 0;
        }
        console.log(this.xRange, mapUtf.width, viewUtf.width, "==构造函数=======", this.yRange, mapUtf.height, viewUtf.height)
        //保存人物位置
        this.lastRoleX = roleNode.position.x;
        this.lastRoleY = roleNode.position.y;

        console.log("摄像头最大移动距离:", this.xRange, this.yRange);
    }

    /**刷新位置 */
    public updatePosition() {
        const rPos = this.roleNode.position;
        //人物未移动，则不需要更新位置
        if (this.lastRoleX == rPos.x && this.lastRoleY == rPos.y) {
            return;
        }
        this.lastRoleX = rPos.x;
        this.lastRoleY = rPos.y
        //人物和地图中点距离//地图根据距离反向移动，这样人物就能一直处于视口中间
        let posX = -rPos.x;
        let posY = -rPos.y;
        //地图边缘检测
        if (posX > this.xRange) {
            posX = this.xRange;
            console.log("摄像头超过右边界");
        } else if (posX < -this.xRange) {
            posX = -this.xRange;
            console.log("摄像头超过左边界");
        }
        if (posY > this.yRange) {
            posY = this.yRange;
            console.log("摄像头超过上边界");
        } else if (posY < -this.yRange) {
            posY = -this.yRange;
            console.log("摄像头超过下边界");
        }

        if (this.mapNode.position.x != posX || this.mapNode.position.y != posY) {
            this.mapNode.setPosition(posX, posY);
        }
    }
}