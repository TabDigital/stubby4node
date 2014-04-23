(function() {
  Object.defineProperty(Number.prototype, "times", {
    configurable: true,
    value: function(fn) {
      var i, _i;
      if (fn == null) {
        fn = function() {};
      }
      if (!(this > 0)) {
        return this;
      }
      for (i = _i = 1; 1 <= this ? _i <= this : _i >= this; i = 1 <= this ? ++_i : --_i) {
        fn();
      }
      return parseFloat(this);
    }
  });

  Object.defineProperty(String.prototype, "times", {
    configurable: true,
    value: function(num) {
      var i, result, _i;
      if (num == null) {
        num = 1;
      }
      result = '';
      if (num < 1) {
        return result;
      }
      for (i = _i = 1; 1 <= num ? _i <= num : _i >= num; i = 1 <= num ? ++_i : --_i) {
        result += this;
      }
      return result;
    }
  });

  module.exports = function(left, right) {
    if (typeof left !== 'number') {
      return;
    }
    if (typeof right === 'function') {
      return left.times(right);
    }
    if (typeof right === 'string') {
      return right.times(left);
    }
  };

}).call(this);
