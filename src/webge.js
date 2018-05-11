/*!
* Webge, entrance of graph editer.
*
* Copyright (c) 2018, Czgump.
* All rights reserved.
*
*/

import WebRender from './webrender';
import guid from './core/guid';

import DrawLine from './tool/draw/DrawLineHandler';
import DrawPolyline from './tool/draw/DrawPolylineHandler';

import Pan from './tool/zoom/PanHandler';
import ZoomIn from './tool/zoom/ZoomInHandler';
import ZoomOut from './tool/zoom/ZoomOutHandler';
import ZoomRect from './tool/zoom/ZoomRectHandler';

/**
 * @type {string}
 */
export var version = '1.0.0';

var drawHandlers = {
    line: DrawLine,
    polyline: DrawPolyline
};

var pageHandlers = {
    pan: Pan,
    zoomin: ZoomIn,
    zoomout: ZoomOut,
    zoomrect: ZoomRect
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
    wr.handler.addOprHandlers(pageHandlers, wr);

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

