/**
 * draw polyline
 * @module webgx/tool/draw/drawPolylineHandler
 */

import OprHandler from '../oprHandler';
import Polyline from '../../graphic/shape/Polyline';

export default OprHandler.extend({
    type: 'polyline',

    mouseup: function (e) {
        var el = this._el;

        if (!el) {
            this._el = new Polyline({
                shape: {
                    points: [[e.zrX, e.zrY], [e.zrX, e.zrY]]
                }
            });

            this.addElToHover();
        } else {
            el.shape.points.push([e.zrX, e.zrY]);
        }
    },

    mousemove: function (e) {
        var el = this._el;

        if (el) {
            var pts = el.shape.points;
            var i = pts.length - 1;
            pts[i][0] = e.zrX;
            pts[i][1] = e.zrY;

            this.wr.refreshHover();
        }
    },

    dblclick: function (e) {
        var el = this._el;

        if (el) {
            var pts = el.shape.points;
            pts.pop(); // 移除多余的点
            pts.pop();

            this.moveElToStorage();
        }
    }
});
