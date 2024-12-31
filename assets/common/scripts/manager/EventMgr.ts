
// import { _decorator, EventTarget } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('EventMgr')
// export class EventMgr extends EventTarget {

//     private static _instance: EventMgr;
//     /**获取层级管理器单例*/
//     static get ins() {
//         if (!this._instance) {
//             this._instance = new EventMgr();
//             this._instance.init();
//         }
//         return this._instance;
//     }


//     /**添加事件监听*/
//     static on(type, callBack, target, once?) {
//         EventMgr.ins.addEvnt(String(type), callBack, target, once);
//     }

//     /**移除事件监听*/
//     static off(type, callBack?, target?) {
//         EventMgr.ins.removeEvnt(String(type), callBack, target);
//     }

//     /**抛出事件*/
//     static emit(eName, options?: Object) {
//         EventMgr.ins.disEvnt(String(eName), options);
//     }


//     init() { }

//     addEvnt(type: string, callBack, target, once?) {
//         super.on(type, callBack, target, once);
//     }

//     removeEvnt(type: string, callBack?, target?) {
//         super.off(type, callBack, target);
//     }


//     disEvnt(eName, data?) {
//         super.emit(eName, data);
//     }

// }




/**
 * 事件管理器
 */

export class EventMgr {
    static handlers: { [name: string]: { handler: Function, target: any }[] } = {};
    static supportEvent: { [name: string]: string };

    public static on(eventName: number, handler: Function, target?: any) {
        const objHandler = { handler: handler, target: target };
        let handlerList = this.handlers[String(eventName)];
        if (!handlerList) {
            handlerList = [];
            this.handlers[String(eventName)] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    };

    public static off(eventName: number, handler: Function, target?: any) {
        const handlerList = this.handlers[String(eventName)];

        if (!handlerList) {
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            const oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    public static emit(eventName: number, ...args: any) {
        // if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
        //     cc.error("please add the event into clientEvent.js");
        //     return;
        // }

        const handlerList = this.handlers[String(eventName)];

        const params = [];
        let i;
        for (i = 1; i < arguments.length; i++) {
            params.push(arguments[i]);
        }

        if (!handlerList) {
            return;
        }

        for (i = 0; i < handlerList.length; i++) {
            const objHandler = handlerList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args);
            }
        }
    };

    /**
     * 设置支持的事件列表
     * @param arrSupportEvent 字符串数组，包含所有支持的事件名称
     */
    public static setSupportEventList(arrSupportEvent: string[]) {
        // 将传入的支持事件列表进行处理并设置
        if (!(arrSupportEvent instanceof Array)) {
            console.error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (let i in arrSupportEvent) {
            const eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }


        return true;
    };
};








export enum EventName {

    /**测试*/
    TEST_1,

    /**成就红点刷新*/
    ACH_RED,


}


