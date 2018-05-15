/*!
* Webgi, entrance of icon editer.
*
* Copyright (c) 2018, czgump.
* All rights reserved.
*
*/

import WebRender from './webrender';
import guid from './core/guid';

import DrawLine from './tool/draw/DrawLineHandler';
import DrawPolyline from './tool/draw/DrawPolylineHandler';

/**
 * @type {string}
 */
export var version = '1.0.0';

var drawHandlers = {
    line: DrawLine,
    polyline: DrawPolyline
};

/**
 * Initializing a webrender instance, and setup operaters
 * @param {HTMLElement} dom
 * @param {Object} opts
 * @param {string} [opts.renderer='canvas'] 'canvas' or 'svg'
 * @param {number} [opts.devicePixelRatio]
 * @param {number|string} [opts.width] Can be 'auto' (the same as null/undefined)
 * @param {number|string} [opts.height] Can be 'auto' (the same as null/undefined)
 * @return {module:webgx/WebRender}
 */
export function init(dom, opts) {
    var wr = new WebRender(guid(), dom, opts);

    wr.handler.addOprHandlers(drawHandlers, wr);

    return wr;
}

/**
 * Dispose webrender instance
 * @param {module:webgx/WebRender} wr
 */
export function dispose(wr) {
    if (wr) {
        wr.dispose();
    }

    return this;
}

