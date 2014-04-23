(function() {
  var ANY_FLAG, UNARY_FLAGS, findOption, indexOfFlag, optionSkipped, pp, pullPassedValue, unaryCheck,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  pp = require('./prettyprint');

  UNARY_FLAGS = /^-[a-zA-Z]+$/;

  ANY_FLAG = /^-.+$/;

  findOption = function(option, argv) {
    var argIndex;
    argIndex = -1;
    if (option.flag != null) {
      argIndex = indexOfFlag(option, argv);
    }
    if (argIndex === -1 && (option.name != null)) {
      argIndex = argv.indexOf("--" + option.name);
    }
    return argIndex;
  };

  indexOfFlag = function(option, argv) {
    var flag, flags, index, _fn, _i, _len;
    flags = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = argv.length; _i < _len; _i++) {
        flag = argv[_i];
        if (flag.match(UNARY_FLAGS)) {
          _results.push(flag);
        }
      }
      return _results;
    })();
    index = -1;
    _fn = function(flag) {
      var _ref;
      if (_ref = option.flag, __indexOf.call(flag, _ref) >= 0) {
        return index = argv.indexOf(flag);
      }
    };
    for (_i = 0, _len = flags.length; _i < _len; _i++) {
      flag = flags[_i];
      _fn(flag);
    }
    return index;
  };

  optionSkipped = function(index, argv) {
    return argv[index + 1].match(ANY_FLAG);
  };

  unaryCheck = function(option, argv) {
    var _ref;
    if ((option.name != null) && (_ref = "--" + option.name, __indexOf.call(argv, _ref) >= 0)) {
      return true;
    }
    if (option.flag == null) {
      return false;
    }
    return indexOfFlag(option, argv) !== -1;
  };

  pullPassedValue = function(option, argv) {
    var argIndex;
    if (option.param == null) {
      return unaryCheck(option, argv);
    }
    argIndex = findOption(option, argv);
    if (argIndex === -1) {
      return option["default"];
    }
    if (argv[argIndex + 1] == null) {
      return option["default"];
    }
    if (!optionSkipped(argIndex, argv)) {
      return argv[argIndex + 1];
    }
    return option["default"];
  };

  module.exports = {
    parse: function(options, argv) {
      var args, option, _fn, _i, _len;
      if (argv == null) {
        argv = process.argv;
      }
      args = {};
      _fn = (function(_this) {
        return function(option) {
          var _ref;
          if (option["default"] == null) {
            option["default"] = null;
          }
          return args[(_ref = option.name) != null ? _ref : options.flag] = pullPassedValue(option, argv);
        };
      })(this);
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        _fn(option);
      }
      return args;
    },
    helpText: function(options, programName) {
      var firstColumn, gutter, helpLines, inlineList, option, _fn, _fn1, _i, _j, _len, _len1;
      inlineList = [];
      firstColumn = {};
      helpLines = [];
      gutter = 3;
      _fn = function(option) {
        var param;
        param = option.param != null ? " <" + option.param + ">" : '';
        firstColumn[option.name] = "-" + option.flag + ", --" + option.name + param;
        inlineList.push("[-" + option.flag + param + "]");
        return gutter = Math.max(gutter, firstColumn[option.name].length + 3);
      };
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        _fn(option);
      }
      _fn1 = (function(_this) {
        return function(option) {
          var helpLine;
          helpLine = firstColumn[option.name];
          helpLine += pp.spacing(gutter - helpLine.length);
          helpLine += pp.wrap(option.description.split(' '), gutter);
          return helpLines.push(helpLine);
        };
      })(this);
      for (_j = 0, _len1 = options.length; _j < _len1; _j++) {
        option = options[_j];
        _fn1(option);
      }
      return "" + programName + " " + (pp.wrap(inlineList, programName.length + 1)) + "\n\n" + (helpLines.join('\n'));
    }
  };

}).call(this);
