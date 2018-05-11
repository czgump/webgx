import {devicePixelRatio} from './config';
import * as util from './core/util';
import log from './core/log';
import BoundingRect from './core/BoundingRect';
import timsort from './core/timsort';
import Image from './graphic/Image';
import Layer from './Layer';
import * as matrix from './core/matrix';
import * as vec2 from './core/vector';
import Style from './graphic/Style';

var painterOpts = {
    maxScale: 1000
};

function parseInt10(val) {
    return parseInt(val, 10);
}

function createRoot(width, height) {
    var domRoot = document.createElement('div');

    // domRoot.onselectstart = returnFalse; // 避免页面选中的尴尬
    domRoot.style.cssText = [
        'position:relative',
        'overflow:hidden',
        'width:' + width + 'px',
        'height:' + height + 'px',
        'padding:0',
        'margin:0',
        'border-width:0'
    ].join(';') + ';';

    return domRoot;
}

/**
 * @alias module:webgx/Painter
 * @constructor
 * @param {HTMLElement::div} root 绘图容器
 * @param {module:webgx/Storage} storage
 * @param {Object} opts
 */
var Painter = function (root, storage, opts) {

    this.type = 'canvas';

    this._opts = opts = util.extend({}, opts || {});

    /**
     * @type {number}
     */
    this.dpr = opts.devicePixelRatio || devicePixelRatio;

    /**
     * 绘图容器
     * @type {HTMLElement::div}
     */
    this.root = root;

    var rootStyle = root.style;

    if (rootStyle) {
        rootStyle['-webkit-tap-highlight-color'] = 'transparent';
        rootStyle['-webkit-user-select'] =
        rootStyle['user-select'] =
        rootStyle['-webkit-touch-callout'] = 'none';

        root.innerHTML = '';
    }

    /**
     * @type {module:webgx/Storage}
     */
    this.storage = storage;

    this._width = this._getSize(0);
    this._height = this._getSize(1);
    this.boundingRect = new BoundingRect(0, 0, this._width, this._height);

    /**
     * 由于每层都对应一个canvas，在所有canvas外面包一层div，用于统一接收各类事件
     * @type {HTMLElement::div}
     */
    var domRoot = this._domRoot = createRoot(
        this._width, this._height
    );
    root.appendChild(domRoot);

    /**
     * 模型图层对应的视图图层
     * @type {Array.<module:webgx/Layer>}
     * @private
     */
    this._vlayers = [];

    /**
     * 悬浮层，主要放一些临时对象（如绘图操作的中间态对象，框选操作时的框选矩形）。
     * 主要是考虑到性能问题，减少刷新图形对象层的次数。
     * @type {module:webgx/Layer}
     * @private
     */
    this._hoverlayer = null;
    this._hoverElements = [];

    this.transform = matrix.create();
    this.invTransform = matrix.create();

    // 计算绘图区域的闭包
    this.calculateBoundingRect();
};

Painter.prototype = {

    constructor: Painter,

    getType: function () {
        return 'canvas';
    },

    /**
     * @return {HTMLDivElement::div}
     */
    getViewportRoot: function () {
        return this._domRoot;
    },

    getViewportRootOffset: function () {
        var viewportRoot = this.getViewportRoot();
        if (viewportRoot) {
            return {
                offsetLeft: viewportRoot.offsetLeft || 0,
                offsetTop: viewportRoot.offsetTop || 0
            };
        }
    },

    /**
     * 计算可见区域坐标范围
     */
    calculateBoundingRect: function () {
        var rect = this.boundingRect;

        if (!rect) {
            rect = this.boundingRect = new BoundingRect(0, 0, 1, 1);
        }

        rect.x = 0;
        rect.y = 0;
        rect.width = this._width;
        rect.height = this._height;
        rect.applyTransform(this.invTransform);
    },

    /**
     * 视图坐标系变换
     * @param {number} dx
     * @param {number} dy
     */
    translate: function (dx, dy) {
        var m = this.transform;
        matrix.translate(m, m, [dx, dy]);
        matrix.invert(this.invTransform, m);

        this.calculateBoundingRect();

        this.refresh(true);
    },

    /**
     * @param {number} cx, center x
     * @param {number} cy, center y
     * @param {number} s, scale factor
     */
    scale: function (cx, cy, s) {
        if (!isFinite(s)) { return; }

        s = Math.abs(s);

        var m = this.transform;
        var im = this.invTransform;

        var v1 = vec2.create(cx, cy);
        // vec2.applyTransform(v1, v1, im); // to canvas dom coord
        vec2.applyTransform(v1, v1, m); // to canvas dom coord

        matrix.scale(m, m, [s, s]);
        matrix.invert(im, m);

        // vec2.applyTransform(v1, v1, m); // to viewer coord
        vec2.applyTransform(v1, v1, im); // to viewer coord

        matrix.translate(m, m, [(v1[0] - cx) * m[0], (v1[1] - cy) * m[0]]);
        matrix.invert(im, m);

        this.calculateBoundingRect();

        Style.GLOBAL_SCALE = m[0];

        this.refresh(true);
    },

    /**
     * @param {object} [rect]
     * @param {number} [rect.x]
     * @param {number} [rect.y]
     * @param {number} [rect.width]
     * @param {number} [rect.height]
     */
    rectScale: function (rect) {
        var m = this.transform;
        var im = this.invTransform;
        var b = this.boundingRect;

        matrix.translate(m, m, [b.x + b.width / 2 - rect.x - rect.width / 2,
                                b.y + b.height / 2 - rect.y - rect.height / 2]);

        matrix.invert(im, m);

        var v1 = vec2.create(300, 300);
        vec2.applyTransform(v1, v1, m);

        var s = Math.min(Math.abs(b.width / rect.width), Math.abs(b.height / rect.height));

        this.scale(rect.x + rect.width / 2, rect.y + rect.height / 2, s);
    },
    
    /**
     * 刷新
     * @param {boolean} [paintAll=false] 强制绘制所有displayable
     */
    refresh: function (paintAll) {
        this._redrawId = Math.random();

        this._paintList(paintAll, this._redrawId);

        // 重复
        // this.refreshHover();

        return this;
    },

    addHover: function (el, hoverStyle) {
        if (el.__hoverMir) {
            return;
        }
        var elMirror = new el.constructor({
            style: el.style,
            shape: el.shape
        });
        elMirror.__from = el;
        el.__hoverMir = elMirror;
        elMirror.setStyle(hoverStyle);

        this._hoverElements.push(elMirror);
    },

    removeHover: function (el) {
        var elMirror = el.__hoverMir;
        var hoverElements = this._hoverElements;
        var idx = util.indexOf(hoverElements, elMirror);
        if (idx >= 0) {
            hoverElements.splice(idx, 1);
        }
        el.__hoverMir = null;
    },

    clearHover: function (el) {
        var hoverElements = this._hoverElements;
        for (var i = 0; i < hoverElements.length; i++) {
            var from = hoverElements[i].__from;
            if (from) {
                from.__hoverMir = null;
            }
        }
        hoverElements.length = 0;
    },

    refreshHover: function () {
        var hoverElements = this._hoverElements;
        var len = hoverElements.length;
        var hoverLayer = this._hoverlayer;
        hoverLayer && hoverLayer.clear();

        if (!len) {
            return;
        }

        if (!hoverLayer) {
            hoverLayer = this._hoverlayer = new Layer(this, this.dpr);
            hoverLayer.dom.id = 'hoverlayer';
            hoverLayer.initContext();
            this._domRoot.appendChild(hoverLayer.dom);
        }

        hoverLayer.paintList(hoverElements);
    },

    _paintList: function (paintAll, redrawId) {
        if (this._redrawId !== redrawId) {
            return;
        }

        paintAll = paintAll || false;

        var storage = this.storage;
        if (!(storage._dirty || paintAll)) {
            return;
        }

        var lyrs = storage._layers;
        var rect = this.boundingRect;

        for (var j = 0; j < lyrs.length; j++) {
            if (!(lyrs[j].dirty || paintAll)) continue;

            var layer = this.getLayer(j);
            layer && layer.refresh(rect, lyrs[j], paintAll);
        }
    },

    /**
     * 获取zlevel所在层，如果不存在则会创建一个新的层（canvas）
     * @param {number} index
     * @return {module:webgx/Layer}
     */
    getLayer: function (index) {
        if (index < 0) {
            return null;
        }

        var lyrs = this._vlayers;
        var lyr = lyrs[index];

        if (!lyr) {
            lyr = new Layer(this, this.dpr);
            lyr.dom.id = 'lyr' + index;
            lyr.initContext();

            this._vlayers[index] = lyr;

            var prevLayer = null;
            for (var i = index - 1; i > -1; i--) {
                if (!!lyrs[i]) {
                    prevLayer = lyrs[i];
                    break;
                }
            }

            if (prevLayer) {
                var prevDom = prevLayer.dom;
                if (prevDom.nextSibling) {
                    this._domRoot.insertBefore(lyr.dom, prevDom.nextSibling);
                } else {
                    this._domRoot.appendChild(lyr.dom);
                }
            } else {
                if (this._hoverlayer) {
                    this._domRoot.insertBefore(lyr.dom, this._hoverlayer.dom);
                } else {
                    this._domRoot.appendChild(lyr.dom);
                }
            }
        }

        return lyr;
    },

    /**
     * 删除指定层
     * @param {number} zlevel 层
     */
    delLayer: function (zlevel) {
        var lyrs = this.storage._layers;

        if (zlevel < 0 || zlevel >= lyrs.length) return;

        this.storage.delLayer(zlevel);

        var vlyrs = this._vlayers;
        var vlyr = vlyrs[zlevel];
        if (vlyr) {
            vlyr.dom.parentNode.removeChild(vlyr.dom);
        }
        vlyrs.splice(zlevel, 1);
    },

    /**
     * 区域大小变化后重绘
     */
    resize: function (width, height) {
        var domRoot = this._domRoot;
        // FIXME Why ?
        domRoot.style.display = 'none';

        // Save input w/h
        var opts = this._opts;
        width != null && (opts.width = width);
        height != null && (opts.height = height);

        width = this._getSize(0);
        height = this._getSize(1);

        domRoot.style.display = '';

        // 优化没有实际改变的resize
        if (this._width != width || height != this._height) {
            domRoot.style.width = width + 'px';
            domRoot.style.height = height + 'px';

            var vlyrs = this._vlayers;
            for (var i = vlyrs.length - 1; i > -1; i--) {
                vlyrs[i].resize(width, height);
            }

            this.calculateBoundingRect();

            this.refresh(true);
        }

        this._width = width;
        this._height = height;

        return this;
    },

    /**
     * 释放
     */
    dispose: function () {
        this.root.innerHTML = '';

        this.root =
        this.storage =

        this._domRoot =
        this._vlayers = null;
    },

    /**
     * 获取绘图区域宽度
     */
    getWidth: function () {
        return this._width;
    },

    /**
     * 获取绘图区域高度
     */
    getHeight: function () {
        return this._height;
    },

    _getSize: function (whIdx) {
        var opts = this._opts;
        var wh = ['width', 'height'][whIdx];
        var cwh = ['clientWidth', 'clientHeight'][whIdx];
        var plt = ['paddingLeft', 'paddingTop'][whIdx];
        var prb = ['paddingRight', 'paddingBottom'][whIdx];

        if (opts[wh] != null && opts[wh] !== 'auto') {
            return parseFloat(opts[wh]);
        }

        var root = this.root;
        // IE8 does not support getComputedStyle, but it use VML.
        var stl = document.defaultView.getComputedStyle(root);

        return (
            (root[cwh] || parseInt10(stl[wh]) || parseInt10(root.style[wh]))
            - (parseInt10(stl[plt]) || 0)
            - (parseInt10(stl[prb]) || 0)
        ) | 0;
    },

    pathToImage: function (path, dpr) {
        dpr = dpr || this.dpr;

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var rect = path.getBoundingRect();
        var style = path.style;
        var shadowBlurSize = style.shadowBlur * dpr;
        var shadowOffsetX = style.shadowOffsetX * dpr;
        var shadowOffsetY = style.shadowOffsetY * dpr;
        var lineWidth = style.hasStroke() ? style.lineWidth : 0;

        var leftMargin = Math.max(lineWidth / 2, -shadowOffsetX + shadowBlurSize);
        var rightMargin = Math.max(lineWidth / 2, shadowOffsetX + shadowBlurSize);
        var topMargin = Math.max(lineWidth / 2, -shadowOffsetY + shadowBlurSize);
        var bottomMargin = Math.max(lineWidth / 2, shadowOffsetY + shadowBlurSize);
        var width = rect.width + leftMargin + rightMargin;
        var height = rect.height + topMargin + bottomMargin;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        ctx.dpr = dpr;

        var pathTransform = {
            position: path.position,
            rotation: path.rotation,
            scale: path.scale
        };
        path.position = [leftMargin - rect.x, topMargin - rect.y];
        path.rotation = 0;
        path.scale = [1, 1];
        path.updateTransform();
        if (path) {
            path.brush(ctx);
        }

        var ImageShape = Image;
        var imgShape = new ImageShape({
            style: {
                x: 0,
                y: 0,
                image: canvas
            }
        });

        if (pathTransform.position != null) {
            imgShape.position = path.position = pathTransform.position;
        }

        if (pathTransform.rotation != null) {
            imgShape.rotation = path.rotation = pathTransform.rotation;
        }

        if (pathTransform.scale != null) {
            imgShape.scale = path.scale = pathTransform.scale;
        }

        return imgShape;
    }
};

export default Painter;