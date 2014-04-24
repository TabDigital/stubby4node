(function() {
  var Endpoint, Endpoints, NOT_FOUND, NO_MATCH, applyTemplating, ce, ejs, found, fs, moment, path;

  ce = require('cloneextend');

  fs = require('fs');

  ejs = require('ejs');

  path = require('path');

  moment = require('moment');

  Endpoint = require('./endpoint');

  NOT_FOUND = "Endpoint with the given id doesn't exist.";

  NO_MATCH = "Endpoint with given request doesn't exist.";

  module.exports.Endpoints = Endpoints = (function() {
    function Endpoints(data, callback, datadir) {
      if (callback == null) {
        callback = (function() {});
      }
      if (datadir == null) {
        datadir = process.cwd();
      }
      this.datadir = datadir;
      this.db = {};
      this.lastId = 0;
      this.create(data, callback);
      this.sightings = {};
    }

    Endpoints.prototype.create = function(data, callback) {
      var insert;
      if (callback == null) {
        callback = function() {};
      }
      insert = (function(_this) {
        return function(item) {
          item = new Endpoint(item, _this.datadir);
          item.id = ++_this.lastId;
          _this.db[item.id] = item;
          _this.sightings[item.id] = 0;
          return callback(null, ce.clone(item));
        };
      })(this);
      if (data instanceof Array) {
        return data.forEach(insert);
      } else if (data) {
        return insert(data);
      }
    };

    Endpoints.prototype.retrieve = function(id, callback) {
      if (callback == null) {
        callback = function() {};
      }
      if (!this.db[id]) {
        return callback(NOT_FOUND);
      }
      return callback(null, ce.clone(this.db[id]));
    };

    Endpoints.prototype.update = function(id, data, callback) {
      var endpoint;
      if (callback == null) {
        callback = function() {};
      }
      if (!this.db[id]) {
        return callback(NOT_FOUND);
      }
      endpoint = new Endpoint(data, this.datadir);
      endpoint.id = id;
      this.db[endpoint.id] = endpoint;
      return callback();
    };

    Endpoints.prototype["delete"] = function(id, callback) {
      if (callback == null) {
        callback = function() {};
      }
      if (!this.db[id]) {
        return callback(NOT_FOUND);
      }
      delete this.db[id];
      return callback();
    };

    Endpoints.prototype.gather = function(callback) {
      var all, endpoint, id, _ref;
      if (callback == null) {
        callback = function() {};
      }
      all = [];
      _ref = this.db;
      for (id in _ref) {
        endpoint = _ref[id];
        all.push(endpoint);
      }
      return callback(null, ce.clone(all));
    };

    Endpoints.prototype.find = function(data, callback) {
      var captures, endpoint, id, matched, _ref;
      if (callback == null) {
        callback = function() {};
      }
      _ref = this.db;
      for (id in _ref) {
        endpoint = _ref[id];
        if (!(captures = endpoint.matches(data))) {
          continue;
        }
        matched = ce.clone(endpoint);
        return found.call(this, matched, captures, callback);
      }
      return callback(NO_MATCH);
    };

    return Endpoints;

  })();

  applyTemplating = function(obj, captures) {
    var key, value, _results;
    _results = [];
    for (key in obj) {
      value = obj[key];
      if (typeof value === 'string' || value instanceof Buffer) {
        _results.push(obj[key] = ejs.render(value.toString().replace(/<%/g, '<%='), captures));
      } else {
        _results.push(applyTemplating(value, captures));
      }
    }
    return _results;
  };

  found = function(endpoint, captures, callback) {
    var response, _ref;
    response = endpoint.response[this.sightings[endpoint.id]++ % endpoint.response.length];
    response.body = new Buffer((_ref = response.body) != null ? _ref : 0, 'utf8');
    response.headers['x-stubby-resource-id'] = endpoint.id;
    captures.moment = moment;
    if (response.file != null) {
      applyTemplating(response, captures);
      try {
        response.body = fs.readFileSync(path.resolve(this.datadir, response.file));
      } catch (_error) {}
    }
    applyTemplating(response, captures);
    if (parseInt(response.latency)) {
      return setTimeout((function() {
        return callback(null, response);
      }), response.latency);
    } else {
      return callback(null, response);
    }
  };

}).call(this);
