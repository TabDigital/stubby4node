(function() {
  var times;

  times = require('../prototype/times');

  module.exports = {
    spacing: function(length) {
      if (length == null) {
        length = 0;
      }
      return ' '.times(length);
    },
    wrap: function(tokens, continuation, columns) {
      var gutter, token, wrapped, _fn, _i, _len;
      if (continuation == null) {
        continuation = 0;
      }
      if (columns == null) {
        columns = process.stdout.columns;
      }
      if (continuation + tokens.join(' ').length <= columns) {
        return tokens.join(' ');
      }
      wrapped = '';
      gutter = this.spacing(continuation);
      _fn = (function(_this) {
        return function(token) {
          var lengthSoFar;
          lengthSoFar = (continuation + (wrapped.replace(/\n/g, '').length) % columns) || columns;
          if ((lengthSoFar + token.length) > columns) {
            return wrapped += "\n" + gutter + token;
          } else {
            return wrapped += " " + token;
          }
        };
      })(this);
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        _fn(token);
      }
      return wrapped.trim();
    }
  };

}).call(this);
