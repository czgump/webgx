/**
 * zoom out
 * @module webgx/tool/zoom/zoomOutHandler
 */

import OprHandler from '../oprHandler';

export default OprHandler.extend({
    type: 'zoomout',

    mousedown: function (e) {
        this.wr.painter.scale(e.zrX, e.zrY, 0.9);
    }
});