/**
 * zoom in
 * @module webgx/tool/zoom/zoomInHandler
 */

import OprHandler from '../oprHandler';

export default OprHandler.extend({
    type: 'zoomin',

    mousedown: function (e) {
        this.wr.painter.scale(e.zrX, e.zrY, 1.2);
    }
});