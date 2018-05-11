/*
 * 人工操作的基类
 * Base class of all operation handlers
 * @module webgx/tool/OprHandler
 */

import * as zrUtil from '../core/util';

/**
 * @alias module:webgx/tool/OprHandler
 * @constructor
 * @param {module:webgx/WebRender} wr
 */
function OprHandler(wr) {
    this.wr = wr;

    /**
     * @type {string}
     */
    this.type = 'none';

    /**
     * @type {module:webgx/graphic/Displayable}
     * @private
     */
    this._el = null;
}

OprHandler.prototype = {
    constructor: OprHandler,

    /**
     * 编辑_el时，把_el放到hover层
     */
    addElToHover: function () {
        var el = this._el;
        var wr = this.wr;
        if (el) {
            wr.addHover(el);
            // el.__zr = wr; // 防止在refreshHover时被删除
        }
    },

    /**
     * _el编辑完成后，把_el从hover层移到模型中
     */
    moveElToStorage: function () {
        var el = this._el;
        var wr = this.wr;

        if (el) {
            wr.removeHover(el);
            el.__zr = null; // 避免add时添加失败
            wr.add(el);

            this._el = null;
        }
    },

    mousedown: function (e) {},
    mouseup: function (e) {},
    mousemove: function (e) {},
    mousewheel: function (e) {},
    dblclick: function (e) {},
    click: function (e) {},
    contextmenu: function (e) {},

    quit: function () {
        var el = this._el;

        if (el) {
            this.wr.clearHover(el);

            this._el = null;
        }
    }
};

OprHandler.extend = function (defaults) {
    var SubOpr = function (opts) {
        OprHandler.call(this, opts);

        this.type = defaults.type || 'none';
    };

    zrUtil.inherits(SubOpr, OprHandler);

    for (var name in defaults) {
        if (name !== 'type') {
            SubOpr.prototype[name] = defaults[name];
        }
    }

    return SubOpr;
};

export default OprHandler;