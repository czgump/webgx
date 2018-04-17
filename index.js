var _webge = require("./lib/webge");

(function () {
  for (var key in _webge) {
    if (_webge == null || !_webge.hasOwnProperty(key) || key === 'default' || key === '__esModule') return;
    exports[key] = _webge[key];
  }
})();

var _export = require("./lib/export");

(function () {
  for (var key in _export) {
    if (_export == null || !_export.hasOwnProperty(key) || key === 'default' || key === '__esModule') return;
    exports[key] = _export[key];
  }
})();

require("./lib/svg/svg");

require("./lib/vml/vml");