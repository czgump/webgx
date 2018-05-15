/**
 * 图块容器（池），用于统一保存使用到的图块
 * @module webgx/graphic/block/BlockPool
 */

function BlockPool() {
    this._blockpool = {};

    this._blockstoread = [];
}

BlockPool.prototype = {

    constructor: BlockPool,

    /**
     * 获取
     * @param type
     * @param name
     */
    refBlock: function (type, name) {
        if (!type || !name) {
            return null;
        }

        var blocks = this._blockpool[type];

        if (!blocks) {
            return null;
        }

        var block = blocks[name];
        if (!block) { // 加到待读列表中，统一从服务端读取
            var toread = this._blockstoread;
            toread[type] ? (toread[type][name] ? toread[type][name] += 1 : toread[type][name] = 1) :
                           (toread[type] = {}, toread[type][name] = 1);
        } else {
            block.ref += 1;
        }

        return block;
    },

    unrefBlock: function (block) {
        block.ref -= 1;
    },

    /**
     * read blocks from server
     * @private
     */
    _readBlock: function () {
        
    }
};

export default BlockPool;