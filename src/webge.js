/*
 * Webge
 *
 * Copyright (c) 2018, Czgump
 * All rights reserved.
 *
 */

import * as zrender from 'zrender/src/zrender';
import * as zrUtil from 'zrender/src/core/util';
import * as colorTool from 'zrender/src/tool/color';
import env from 'zrender/src/core/env';
import timsort from 'zrender/src/core/timsort';
import Eventful from 'zrender/src/mixin/Eventful';

export var version = '1.0.0';

export var dependencies = {
    zrender: '4.0.3'
};

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
 * @module webge~Webge
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

            debugger

            console.info(eveName);
            console.info(el);
        }, this);
    }, this);
};