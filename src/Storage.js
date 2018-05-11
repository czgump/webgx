/**
 * @module webgx/Storage
 * @author czgump
 */

import * as util from './core/util';
import env from './core/env';
import Group from './container/Group';

/**
 * 内容仓库 (M)
 * @alias module:webgx/Storage
 * @constructor
 */
var Storage = function () {
    this._layers = [{ title:'layer', visible: true, enabled: true, dirty: false, objList:[] }];

    this._dirty = false;
};

Storage.prototype = {

    constructor: Storage,

    insertLayer: function (index, opts) {
        var lyrs = this._layers;

        if (index < 0) index = 0;
        if (index > lyrs.length) index = lyrs.length;

        lyrs.splice(index, 0, {
            title: (opts && opts.title) ? opts.title : 'layer',
            visible: (opts && opts.visible) ? true : false,
            enabled: (opts && opts.enabled) ? true : false,
            dirty: false,
            objList:[] });
    },

    delLayer: function (index) {
        var lyrs = this._layers;

        if (index < 0 || index >= lyrs.length) {
            this.delShape(null); // 删除所有shape
            this._layers = [];
            this._dirty = true;

            return;
        }

        var lyr = lyrs[index];

        this.delShape(lyr.objList);

        lyrs.splice(index, 1);

        this._dirty = true;
    },

    /**
     * 添加图形(Shape)或者组(Group)到图层中
     * @param {module:webgx/Element} el
     */
    addShape: function (el, layerIndex) {
        if (el.__storage === this) {
            return;
        }

        var lyrs = this._layers;
        if (!layerIndex){
            for (var i = lyrs.length - 1; i > -1; i--) {
                if (lyrs[i].enabled) {
                    layerIndex = i;
                    break;
                }
            }
        } else {
            if (layerIndex < 0 || layerIndex >= lyrs.length) {
                return;
            }
        }

        var lyr = lyrs[layerIndex];

        if (el instanceof Group) {
            el.addChildrenToStorage(this);
        }

        this.addToStorage(el);
        el.zlevel = layerIndex;
        lyr.dirty = true;
        lyr.objList.push(el);
        this._dirty = true;
    },

    /**
     * 删除指定的图形(Shape)或者组(Group)
     * @param {string|Array.<string>} [el] 如果为空清空整个Storage
     */
    delShape: function (el) {
        if (el == null) {
            // 不指定el清空
            for (var i = 0; i < this._layers.length; i++) {
                var lyr = this._layers[i];
                for (var j = 0; j < lyr.objList.length; j++) {
                    var root = lyr.objList[j];
                    root.__storage = null;
                    if (root instanceof Group) {
                        root.delChildrenFromStorage(this);
                    }
                }

                lyr.dirty = true;
                lyr.objList = [];
            }

            this._dirty = true;
            return;
        }

        if (el instanceof Array) {
            for (var i = 0, l = el.length; i < l; i++) {
                this.delShape(el[i]);
            }

            return;
        }

        var layerIndex = el.zlevel;
        var lyrs = this._layers;
        if (layerIndex < 0 || layerIndex >= lyrs.length) {
            return;
        }

        var lyr = lyrs[layerIndex];
        var idx = util.indexOf(lyr.objList, el);
        if (idx >= 0) {
            this.delFromStorage(el);
            lyr.objList.splice(idx, 1);
            if (el instanceof Group) {
                el.delChildrenFromStorage(this);
            }
            lyr.dirty = true;
        }
    },

    addToStorage: function (el) {
        if (el) {
            el.__storage = this;
            el.dirty(false);
        }
        return this;
    },

    delFromStorage: function (el) {
        if (el) {
            el.__storage = null;
        }

        return this;
    },

    /**
     * 清空并且释放Storage
     */
    dispose: function () {
        this._layers = null;
    }
};

export default Storage;