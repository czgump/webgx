/**
 * draw line
 * @module webgx/tool/draw/drawLineHandler
 */

import OprHandler from '../oprHandler';
import Line from '../../graphic/shape/Line';

export default OprHandler.extend({
    type: 'line',

    mouseup: function (e) {
        var el = this._el;

        if (!el) {
            el = this._el = new Line({
                shape: {
                    x1: e.zrX,
                    y1: e.zrY,
                    x2: e.zrX,
                    y2: e.zrY,
                    percent: 1
                }
            });

            this.addElToHover();
        } else {
            this.moveElToStorage();
        }
    },

    mousemove: function (e) {
        var el = this._el;

        if (el) {
            el.attr({
                shape: {
                    x2: e.zrX,
                    y2: e.zrY
                }
            });

            this.wr.refreshHover();
        }
    }
});

