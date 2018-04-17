/*
 * Webge, a 2d drawing application modified from zrender
 *
 * Copyright (c) 2018, Czgump
 * All rights reserved.
 *
 */

import guid from './core/guid';
import env from './core/env';
import * as zrUtil from './core/util';
import Handler from './Handler';
import Storage from './Storage';
import Painter from './Painter';
import Animation from './animation/Animation';
import HandlerProxy from './dom/HandlerProxy';

var useVML = !env.canvasSupported;

var painterCtors = {
    canvas: Painter
};

var instances = {};  // Webge实例map索引

/**
 * @type {string}
 */
export var version = '1.0.0';

/**
 * Initializing a webge instance
 * @param {HTMLElement} dom
 * @param {Object} opts
 * @param {string} [opts.renderer='canvas] 'canvas' or 'svg'
 * @param {number} [opts.devicePixelRatio]
 * @param {number|string} [opts.width] Can be 'auto' (the same as null/undefined)
 * @param {number|string} [opts.height] Can be 'auto' (the same as null/undefined)
 * @return {module:webgx/Webge}
 */
export function init(dom, opts) {
    var zr = new Webge(guid(), dom, opts);
    instances[zr.id] = zr;
    return zr;
}

/**
 * Dispose webge instance
 * @param {module:webgx/Webge} zr
 */
export function dispose(zr) {
    if (zr) {
        zr.dispose();
    } else {
        for (var key in instances) {
            if (instances.hasOwnProperty(key)) {
                instances[key].dispose();
            }
        }
        instances = {};
    }

    return this;
}

/**
 * Get Webge instance by id
 * @param {string} id webge instance id
 * @return {module:webgx/Webge}
 */
export function getInstance(id) {
    return instances[id];
}

export function registerPainter(name, Ctor) {
    painterCtors[name] = Ctor;
}

/**
 * @module webgx/Webge
 */
/**
 * @constructor
 * @alias module:webgx/Webge
 * @param {string} id
 * @param {HTMLElement} dom
 * @param {Object} opts
 * @param {string} [opts.renderer='canvas'] 'canvas' or 'svg'
 * @param {number} [opts.devicePixelRatio]
 * @param {number} [opts.width] Can be 'auto' (the same as null/undefined)
 * @param {number} [opts.height] Can be 'auto' (the same as null/undefined)
 */
var Webge = function (id, dom, opts) {
    opts = opts || {};

    /**
     * @type {HTMLDomElement}
     */
    this.dom = dom;

    /**
     * @type {string}
     */
    this.id = id;

    var self = this;
    var storage = new Storage();
    var rendererType = opts.renderer;

    if (useVML) {
        if (!painterCtors.vml) {
            throw new Error('You need to require \'vml\' to support IE8');
        }
        rendererType = 'vml';
    } else if (!rendererType || !painterCtors[rendererType]) {
        rendererType = 'canvas';
    }
    var painter = new painterCtors[rendererType](dom, storage, opts, id);
    var handlerProxy = (!env.node && !env.worker) ? new HandlerProxy(painter.getViewportRoot()) : null;

    // mvc
    this.storage = storage;
    this.painter = painter;
    this.handler = new Handler(storage, painter, handlerProxy, painter.root);

    /**
     * @type {module:webgx/animation/Animation}
     */
    this.animation = new Animation({
        stage: {
            update: zrUtil.bind(this.flush, this)
        }
    });
    this.animation.start();
};