(function() {
  var args, fs, out, path, yaml;

  fs = require('fs');

  path = require('path');

  yaml = require('js-yaml');

  out = require('./out');

  args = require('./args');

  module.exports = {
    options: [
      {
        name: 'admin',
        flag: 'a',
        param: 'port',
        "default": 8889,
        description: 'Port for admin portal. Defaults to 8889.'
      }, {
        name: 'cert',
        flag: 'c',
        param: 'file',
        "default": "" + __dirname + "/../../tls/cert.pem",
        description: 'Certificate file. Use with --key.'
      }, {
        name: 'data',
        flag: 'd',
        param: 'file',
        description: 'Data file to pre-load endoints. YAML or JSON format.'
      }, {
        name: 'help',
        flag: 'h',
        "default": false,
        description: 'This help text.'
      }, {
        name: 'key',
        flag: 'k',
        param: 'file',
        "default": "" + __dirname + "/../../tls/key.pem",
        description: 'Private key file. Use with --cert.'
      }, {
        name: 'location',
        flag: 'l',
        param: 'hostname',
        "default": '0.0.0.0',
        description: 'Hostname at which to bind stubby.'
      }, {
        name: 'mute',
        flag: 'm',
        description: 'Prevent stubby from printing to the console.'
      }, {
        name: 'pfx',
        flag: 'p',
        param: 'file',
        description: 'PFX file. Ignored if used with --key/--cert'
      }, {
        name: 'stubs',
        flag: 's',
        param: 'port',
        "default": 8882,
        description: 'Port for stubs portal. Defaults to 8882.'
      }, {
        name: 'tls',
        flag: 't',
        param: 'port',
        "default": 7443,
        description: 'Port for https stubs portal. Defaults to 7443.'
      }, {
        name: 'version',
        flag: 'v',
        description: "Prints stubby's version number."
      }, {
        name: 'watch',
        flag: 'w',
        description: "Auto-reload data file when edits are made."
      }
    ],
    help: function(go) {
      if (go == null) {
        go = false;
      }
      if (!go) {
        return;
      }
      out.log(args.helpText(this.options, 'stubby'));
      return process.exit();
    },
    version: function(go) {
      var version;
      if (go == null) {
        go = false;
      }
      version = (require('../../package.json')).version;
      if (!go) {
        return version;
      }
      out.log(version);
      return process.exit();
    },
    data: function(filename) {
      var e, filedata;
      if (filename === null) {
        return [];
      }
      filedata = [];
      try {
        filedata = (fs.readFileSync(filename, 'utf8')).trim();
      } catch (_error) {
        e = _error;
        out.warn("File '" + filename + "' could not be found. Ignoring...");
        return [];
      }
      try {
        return yaml.load(filedata);
      } catch (_error) {
        e = _error;
        out.warn("Couldn't parse '" + filename + "' due to syntax errors:");
        out.log(e.message);
        return process.exit(0);
      }
    },
    key: function(file) {
      return this.readFile(file, 'pem');
    },
    cert: function(file) {
      return this.readFile(file, 'pem');
    },
    pfx: function(file) {
      return this.readFile(file, 'pfx');
    },
    readFile: function(filename, type) {
      var extension, filedata;
      if (filename === null) {
        return null;
      }
      filedata = fs.readFileSync(filename, 'utf8');
      extension = filename.replace(/^.*\.([a-zA-Z0-9]+)$/, '$1');
      if (!filedata) {
        return null;
      }
      if (extension !== type) {
        out.warn("[" + flag + ", " + option + "] only takes files of type ." + type + ". Ignoring...");
        return null;
      }
      return filedata.trim();
    },
    getArgs: function(argv) {
      var option, params, _fn, _i, _len, _ref;
      if (argv == null) {
        argv = process.argv;
      }
      params = args.parse(this.options, argv);
      params.datadir = path.resolve(path.dirname(params.data));
      if (params.watch) {
        params.watch = params.data;
      }
      _ref = this.options;
      _fn = (function(_this) {
        return function(option) {
          if (_this[option.name] != null) {
            return params[option.name] = _this[option.name](params[option.name]);
          }
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        _fn(option);
      }
      return params;
    }
  };

}).call(this);
