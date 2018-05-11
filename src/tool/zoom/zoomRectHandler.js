/**
 * zoom rect
 * @module webgx/tool/zoom/zoomRectHandler
 */

import OprHandler from '../oprHandler';
import Rect from '../../graphic/shape/Rect';

export default OprHandler.extend({
    type: 'zoomrect',

    mousedown: function (e) {
        this.quit();

        this._el = new Rect({
                                shape: {
                                    r: 0,
                                    x: e.zrX,
                                    y: e.zrY,
                                    width: 0,
                                    height: 0
                                },
                                style: {
                                    fill: 'none',
                                    stroke: 'black'
                                }
                            });

        this.addElToHover();
    },

    mousemove: function (e) {
        var el = this._el;

        if (el) {
            el.attr({
                shape: {
                    width: e.zrX - el.shape.x,
                    height: e.zrY - el.shape.y
                }
            });

            this.wr.refreshHover();
        }
    },

    mouseup: function (e) {
        var el = this._el;

        if (!el) {
            return;
        }

        var shape = el.shape;
        var wr = this.wr;
        wr.clearHover(el);

        this._el = null;
        wr.painter.rectScale(shape);
    }
});