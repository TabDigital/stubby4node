(function() {
  var Admin, CLI, Endpoints, Stubby, Stubs, Watcher, async, contract, couldNotSave, createHttpsOptions, http, https, onEndpointLoaded, onError, onListening, out, setupStartOptions,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Admin = require('./portals/admin').Admin;

  Stubs = require('./portals/stubs').Stubs;

  Endpoints = require('./models/endpoints').Endpoints;

  Watcher = require('./console/watch');

  async = require('async');

  CLI = require('./console/cli');

  out = require('./console/out');

  http = require('http');

  https = require('https');

  contract = require('./models/contract');

  couldNotSave = "The supplied endpoint data couldn't be saved";

  onListening = function(portal, port, protocol, location) {
    if (protocol == null) {
      protocol = 'http';
    }
    return out.status("" + portal + " portal running at " + protocol + "://" + location + ":" + port);
  };

  onError = function(err, port, location) {
    var msg;
    msg = "" + err.message + ". Exiting...";
    switch (err.code) {
      case 'EACCES':
        msg = "Permission denied for use of port " + port + ". Exiting...";
        break;
      case 'EADDRINUSE':
        msg = "Port " + port + " is already in use! Exiting...";
        break;
      case 'EADDRNOTAVAIL':
        msg = "Host \"" + options.location + "\" is not available! Exiting...";
    }
    out.error(msg);
    console.dir(err);
    return process.exit();
  };

  onEndpointLoaded = function(err, endpoint) {
    return out.notice("Loaded: " + endpoint.request.method + " " + endpoint.request.url);
  };

  setupStartOptions = function(options, callback) {
    var defaults, key, value;
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (options.mute == null) {
      options.mute = true;
    }
    defaults = CLI.getArgs([]);
    for (key in defaults) {
      value = defaults[key];
      if (options[key] == null) {
        options[key] = value;
      }
    }
    out.mute = options.mute;
    return [options, callback];
  };

  createHttpsOptions = function(options) {
    var httpsOptions;
    httpsOptions = {};
    if (options.key && options.cert) {
      httpsOptions = {
        key: options.key,
        cert: options.cert
      };
    } else if (options.pfx) {
      httpsOptions = {
        pfx: options.pfx
      };
    }
    return httpsOptions;
  };

  module.exports.Stubby = Stubby = (function() {
    function Stubby() {
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.endpoints = new Endpoints();
      this.stubsPortal = null;
      this.tlsPortal = null;
      this.adminPortal = null;
    }

    Stubby.prototype.start = function(options, callback) {
      if (options == null) {
        options = {};
      }
      if (callback == null) {
        callback = function() {};
      }
      return this.stop((function(_this) {
        return function() {
          var errors, _ref;
          _ref = setupStartOptions(options, callback), options = _ref[0], callback = _ref[1];
          if (errors = contract(options.data)) {
            return callback(errors);
          }
          if (options.datadir != null) {
            _this.endpoints.datadir = options.datadir;
          }
          _this.endpoints.create(options.data, onEndpointLoaded);
          _this.tlsPortal = https.createServer(createHttpsOptions(options), new Stubs(_this.endpoints).server);
          _this.tlsPortal.on('listening', function() {
            return onListening('Stubs', options.tls, 'https', options.location);
          });
          _this.tlsPortal.on('error', function(err) {
            return onError(err, options.tls, options.location);
          });
          _this.tlsPortal.listen(options.tls, options.location);
          _this.stubsPortal = http.createServer(new Stubs(_this.endpoints).server);
          _this.stubsPortal.on('listening', function() {
            return onListening('Stubs', options.stubs, 'http', options.location);
          });
          _this.stubsPortal.on('error', function(err) {
            return onError(err, options.stubs, options.location);
          });
          _this.stubsPortal.listen(options.stubs, options.location);
          _this.adminPortal = http.createServer(new Admin(_this.endpoints).server);
          _this.adminPortal.on('listening', function() {
            return onListening('Admin', options.admin, 'http', options.location);
          });
          _this.adminPortal.on('error', function(err) {
            return onError(err, options.admin, options.location);
          });
          _this.adminPortal.listen(options.admin, options.location);
          if (options.watch) {
            _this.watcher = new Watcher(_this.endpoints, options.watch);
          }
          out.info('\nQuit: ctrl-c\n');
          return callback();
        };
      })(this));
    };

    Stubby.prototype.stop = function(callback) {
      if (callback == null) {
        callback = function() {};
      }
      return process.nextTick((function(_this) {
        return function() {
          if (_this.watcher != null) {
            _this.watcher.deactivate();
          }
          return async.parallel({
            closeAdmin: function(cb) {
              var _ref;
              if ((_ref = _this.adminPortal) != null ? _ref.address() : void 0) {
                return _this.adminPortal.close(cb);
              } else {
                return cb();
              }
            },
            closeStubs: function(cb) {
              var _ref;
              if ((_ref = _this.stubsPortal) != null ? _ref.address() : void 0) {
                return _this.stubsPortal.close(cb);
              } else {
                return cb();
              }
            },
            closeTls: function(cb) {
              var _ref;
              if ((_ref = _this.tlsPortal) != null ? _ref.address() : void 0) {
                return _this.tlsPortal.close(cb);
              } else {
                return cb();
              }
            }
          }, callback);
        };
      })(this));
    };

    Stubby.prototype.post = function(data, callback) {
      if (callback == null) {
        callback = function() {};
      }
      return process.nextTick((function(_this) {
        return function() {
          if (contract(data)) {
            return callback(couldNotSave);
          }
          return _this.endpoints.create(data, callback);
        };
      })(this));
    };

    Stubby.prototype.get = function(id, callback) {
      if (id == null) {
        id = (function() {});
      }
      if (callback == null) {
        callback = id;
      }
      return process.nextTick((function(_this) {
        return function() {
          if (typeof id === 'function') {
            return _this.endpoints.gather(callback);
          } else {
            return _this.endpoints.retrieve(id, callback);
          }
        };
      })(this));
    };

    Stubby.prototype.put = function(id, data, callback) {
      if (callback == null) {
        callback = function() {};
      }
      return process.nextTick((function(_this) {
        return function() {
          if (contract(data)) {
            return callback(couldNotSave);
          }
          return _this.endpoints.update(id, data, callback);
        };
      })(this));
    };

    Stubby.prototype["delete"] = function(id, callback) {
      if (id == null) {
        id = (function() {});
      }
      if (callback == null) {
        callback = id;
      }
      return process.nextTick((function(_this) {
        return function() {
          if (typeof id === 'function') {
            delete _this.endpoints.db;
            _this.endpoints.db = {};
            return callback();
          } else {
            return _this.endpoints["delete"](id, callback);
          }
        };
      })(this));
    };

    return Stubby;

  })();

}).call(this);
