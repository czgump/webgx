/*
 * Webgx
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

var assert = zrUtil.assert;
var each = zrUtil.each;
var isFunction = zrUtil.isFunction;
var isObject = zrUtil.isObject;

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
 * @module webgx~MessageCenter
 */
function MessageCenter() {
    Eventful.call(this);
}
MessageCenter.prototype.on = createRegisterEventWithLowercaseName('on');
MessageCenter.prototype.off = createRegisterEventWithLowercaseName('off');
MessageCenter.prototype.one = createRegisterEventWithLowercaseName('one');
zrUtil.mixin(MessageCenter, Eventful);


/**
 * @module webgx~Webgx
 */
function  Webgx(dom, opts) {
    opts = opts || {};


}

