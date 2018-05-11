/**
 * Block，图块
 * @module webgx/graphic/block/Block
 */

import * as zrUtil from '../../core/util';
import Displayable from '../Displayable';
import BoundingRect from '../../core/BoundingRect';

/**
 * @alias module:webgx/graphic/block/Block
 * @constructor
 * @extends module:webgx/graphic/Displayable
 */
var Block = function (opts) {

    Displayable.call(this, opts);

    this._children = [];
};

Block.prototype = {

    constructor: Block,

    /**
     * @type {string}
     */
    type: 'block',

    brush: function (ctx, prevEl) {
        // todo
    },

    contain: function (x, y) {
        // todo
    },

    /**
     * @return {module:zrender/core/BoundingRect}
     */
    getBoundingRect: function (includeChildren) {
        // TODO Caching
        var rect = null;
        var tmpRect = new BoundingRect(0, 0, 0, 0);
        var children = includeChildren || this._children;
        var tmpMat = [];

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.ignore || child.invisible) {
                continue;
            }

            var childRect = child.getBoundingRect();
            var transform = child.getLocalTransform(tmpMat);
            // TODO
            // The boundingRect cacluated by transforming original
            // rect may be bigger than the actual bundingRect when rotation
            // is used. (Consider a circle rotated aginst its center, where
            // the actual boundingRect should be the same as that not be
            // rotated.) But we can not find better approach to calculate
            // actual boundingRect yet, considering performance.
            if (transform) {
                tmpRect.copy(childRect);
                tmpRect.applyTransform(transform);
                rect = rect || tmpRect.clone();
                rect.union(tmpRect);
            }
            else {
                rect = rect || childRect.clone();
                rect.union(childRect);
            }
        }
        return rect || tmpRect;
    }
};

zrUtil.inherits(Block, Displayable);

export default Block;