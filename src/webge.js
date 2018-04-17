/*
 * Webge, a 2d graph edit application based on modified zrender-4.0.3.
 *
 * Copyright (c) 2018, Czgump
 * All rights reserved.
 *
 */

import * as zrender from './zrender';
import * as zrUtil from './src/core/util';
import * as colorTool from './src/tool/color';
import env from './src/core/env';
import timsort from './src/core/timsort';
import Eventful from './src/mixin/Eventful';

/**
 * @type {string}
 */
export var version = '1.0.0';

function createRegisterEventWithLowercaseName(method) {
    return function (eventName, handler, context) {
        // Event name is all lowercase
        eventName = eventName && eventName.toLowerCase();
        Eventful.prototype[method].call(this, eventName, handler, context);
    };
}

/**
 * @module webge~MessageCenter
 */
function MessageCenter() {
    Eventful.call(this);
}
MessageCenter.prototype.on = createRegisterEventWithLowercaseName('on');
MessageCenter.prototype.off = createRegisterEventWithLowercaseName('off');
MessageCenter.prototype.one = createRegisterEventWithLowercaseName('one');
zrUtil.mixin(MessageCenter, Eventful);

/**
 * @module webgx/Webge
 */
/**
 * @constructor
 * @alias module:webgx/Webge
 * @param {HTMLElement} dom
 * @param {Object} opts
 * @param {string} [opts.renderer='canvas'] 'canvas' or 'svg'
 * @param {number} [opts.devicePixelRatio]
 * @param {number} [opts.width] Can be 'auto' (the same as null/undefined)
 * @param {number} [opts.height] Can be 'auto' (the same as null/undefined)
 */
function Webge(dom, opts) {
    opts = opts || {};

    /**
     * @type {module:zrender/ZRender}
     * @private
     */
    var zr = this._zr = zrender.init(dom, {
        renderer: opts.renderer || 'canvas',
        devicePixelRatio: opts.devicePixelRatio,
        width: opts.width,
        height: opts.height
    });

    // Init mouse events
    this._initEvents();
}

var webgeProto = Webge.prototype;

/**
 * @private
 */
webgeProto._initEvents = function () {
    zrUtil.each(['click', 'dbclick','mousemove','mousedown','mouseup'], function (eveName) {
        this._zr.on(eveName, function (e) {
            var el = e.target;

            console.info(eveName);
            console.info(el);
        }, this);
    }, this);
};

/**
 * 切换当前的操作工具类型
 * @param {string} type
 */
webgeProto.switchTool = function (type) {
    this._zr.handler.switchTool(type);
};