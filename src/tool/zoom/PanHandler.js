/**
 * pan
 * @module webgx/tool/zoom/panHandler
 */

import OprHandler from '../oprHandler';
import * as vector from '../../core/vector';

export default OprHandler.extend({
    type: 'pan',

    pos1: null,

    mousedown: function (e) {
        var pos = this.pos1;
        if (!pos) {
            pos = this.pos1 = vector.create(e.zrX, e.zrY);
        } else {
            pos[0] = e.zrX;
            pos[1] = e.zrY;
        }
    },

    mousemove: function (e) {
        var pos = this.pos1;

        if (pos) {
            this.wr.painter.translate(e.zrX - pos[0], e.zrY - pos[1]);
        }
    },

    mouseup: function (e) {
        this.pos1 = null;
    }
});
