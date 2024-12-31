
import { _decorator, Component, Label, Layers, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('GameMgr')
export class GameMgr extends Component {

    private static _instance: GameMgr;
    /**获取游戏控制器器单例*/
    static get ins() {
        if (!this._instance) {
            this._instance = new GameMgr();
            this._instance.init();
        }
        return this._instance;
    }


    init() {
    }


    //============基础通用方法 节点创建与处理.......................
    //============基础通用方法 节点创建与处理.......................


    /**创建图片
     * @param pNode : 父节点
    */
    public static createNode(pNode?: Node, name: string = ""): Node {
        let nodeItem = new Node(name);
        nodeItem.layer = Layers.Enum.UI_2D;
        if (pNode) {
            nodeItem.parent = pNode;
        }
        nodeItem.addComponent(UITransform);
        return nodeItem;
    }

    /**创建未裁剪的原尺寸图片
     * @param pNode : 父节点
    */
    public static createRawImg(pNode: Node, name?: string): Sprite {
        const img = this.createImg(pNode, name);
        img.sizeMode = Sprite.SizeMode.RAW;
        img.trim = false;
        return img;
    }

    /**创建图片
     * @param pNode : 父节点
    */
    public static createImg(pNode: Node, name?: string): Sprite {
        const nodeImg = this.createNode(pNode, name);
        const img = nodeImg.addComponent(Sprite);
        return img;
    }

    /**创建文本节点
     * @param pNode : 父节点
    */
    public static createTxt(pNode: Node, name?: string, size?: number, font: boolean = true): Label {
        const nodeTxt = this.createNode(pNode, name);
        const txt = nodeTxt.addComponent(Label);
        if (size) {
            txt.fontSize = size;
            txt.lineHeight = size;
        }
        // //设置字体
        // if (font && MainCtrl.M_Font) {
        //     txt.useSystemFont = false;
        //     txt.font = MainCtrl.M_Font;
        // }
        return txt;
    }




}
