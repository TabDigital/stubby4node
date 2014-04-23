(function() {
  var stripper;

  stripper = function(args) {
    var key, value;
    for (key in args) {
      value = args[key];
      args[key] = value.replace(/\u001b\[(\d+;?)+m/g, '');
    }
    return args;
  };

  module.exports = function(console) {
    var fn, _fn, _i, _len, _ref;
    if (process.stdout.isTTY) {
      return true;
    }
    console.raw = {};
    _ref = ['log', 'warn', 'info', 'error'];
    _fn = function(fn) {
      console.raw[fn] = console[fn];
      return console[fn] = function() {
        return console.raw[fn].apply(null, stripper(arguments));
      };
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fn = _ref[_i];
      _fn(fn);
    }
    return false;
  };

}).call(this);
