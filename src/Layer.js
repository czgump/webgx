/**
 * @module webgx/Layer
 * @author czgump
 */

import * as util from './core/util';
import {devicePixelRatio} from './config';
import Style from './graphic/Style';
import Pattern from './graphic/Pattern';
import BoundingRect from "./core/BoundingRect";

function returnFalse() {
    return false;
}

var tmpRect = new BoundingRect(0, 0, 0, 0);
function isDisplayableCulled(el, rect) {
    tmpRect.copy(el.getBoundingRect());
    if (el.transform) {
        tmpRect.applyTransform(el.transform);
    }
    return !tmpRect.intersect(rect);
}

/**
 * 创建dom
 *
 * @inner
 * @param {Painter} painter painter instance
 * @param {number} number
 */
function createDom(painter, dpr) {
    var newDom = util.createCanvas();
    var width = painter.getWidth();
    var height = painter.getHeight();

    var newDomStyle = newDom.style;
    if (newDomStyle) {  // In node or some other non-browser environment
        newDomStyle.position = 'absolute';
        newDomStyle.left = 0;
        newDomStyle.top = 0;
        newDomStyle.width = width + 'px';
        newDomStyle.height = height + 'px';
    }

    newDom.width = width * dpr;
    newDom.height = height * dpr;

    return newDom;
}

/**
 * @alias module:webgx/Layer
 * @constructor
 * @extends module:webgx/mixin/Transformable
 * @param {module:webgx/Painter} painter
 * @param {number} [dpr]
 */
var Layer = function(painter, dpr) {
    var dom;
    dpr = dpr || devicePixelRatio;

    dom = createDom(painter, dpr);

    this.dom = dom;

    var domStyle = dom.style;
    if (domStyle) { // Not in node
        dom.onselectstart = returnFalse; // 避免页面选中的尴尬
        domStyle['-webkit-user-select'] = 'none';
        domStyle['user-select'] = 'none';
        domStyle['-webkit-touch-callout'] = 'none';
        domStyle['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
        domStyle['padding'] = 0;
        domStyle['margin'] = 0;
        domStyle['border-width'] = 0;
    }

    this.painter = painter;

    /**
     * Layer dpr
     * @type {number}
     */
    this.dpr = dpr;
};

Layer.prototype = {

    constructor: Layer,

    initContext: function () {
        this.ctx = this.dom.getContext('2d');
        this.ctx.dpr = this.dpr;
    },

    /**
     * @param  {number} width
     * @param  {number} height
     */
    resize: function (width, height) {
        var dpr = this.dpr;

        var dom = this.dom;
        var domStyle = dom.style;

        if (domStyle) {
            domStyle.width = width + 'px';
            domStyle.height = height + 'px';
        }

        dom.width = width * dpr;
        dom.height = height * dpr;
    },

    /**
     * 刷新图层
     * @param {module:webgx/core/BoundingRect} rect
     * @param lyr
     * @param paintAll
     * @param scope
     */
    refresh: function (rect, lyr, paintAll) {
        if (!lyr.dirty && !paintAll) {
            return;
        }

        this.clear();

        this.paint(rect, lyr, paintAll);
    },

    /**
     * 清空该层画布
     */
    clear: function () {
        var dom = this.dom;
        var ctx = this.ctx;
        var width = dom.width;
        var height = dom.height;

        ctx.clearRect(0, 0, width, height);
    },

    /**
     * 绘制画面
     */
    paint: function (rect, lyr) {
        if (!lyr.visible) { return; }

        var scope = {};
        var ctx = this.ctx;
        var list = lyr.objList;
        var m = this.painter.transform;
        var dpr = this.dpr;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.transform(m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr);

        for (var i = 0; i < list.length; i++) {
            var el = list[i];

            if (el.ignore || el.invisible) continue;

            el.beforeUpdate();

            if (el.__dirty) {
                el.update();
            }

            el.afterUpdate();

            var m = el.transform;
            if (!el.ignore
                && !el.invisible
                && el.style.opacity !== 0
                && !(m && !m[0] && !m[3])
                && !(el.culling && isDisplayableCulled(el, rect))) {
                el.beforeBrush && el.beforeBrush(ctx);

                ctx.save();
                el.brush(ctx, scope.prevEl || null);
                ctx.restore();

                scope.prevEl = el;

                el.afterBrush && el.afterBrush(ctx);
            }
        }
        ctx.restore();

        lyr.dirty = false;
    },
    
    paintList: function (list) {
        var scope = {};
        var ctx = this.ctx;
        var m = this.painter.transform;
        var dpr = this.dpr;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.transform(m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr);

        for (var i = 0; i < list.length; i++) {
            var el = list[i];

            el.beforeUpdate();

            if (el.__dirty) {
                el.update();
            }

            el.afterUpdate();

            var m = el.transform;

            el.beforeBrush && el.beforeBrush(ctx);

            ctx.save();
            el.brush(ctx, scope.prevEl || null);
            ctx.restore();

            scope.prevEl = el;

            el.afterBrush && el.afterBrush(ctx);
        }
        ctx.restore();
    }
};

export default Layer;