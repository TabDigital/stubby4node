(function() {
  var Portal, Stubs, extractQuery, extractUrl, qs,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Portal = require('./portal').Portal;

  qs = require('querystring');

  module.exports.Stubs = Stubs = (function(_super) {
    __extends(Stubs, _super);

    function Stubs(endpoints) {
      this.server = __bind(this.server, this);
      this.Endpoints = endpoints;
      this.name = '[stubs]';
    }

    Stubs.prototype.server = function(request, response) {
      var data;
      data = null;
      request.on('data', function(chunk) {
        data = data != null ? data : '';
        return data += chunk;
      });
      return request.on('end', (function(_this) {
        return function() {
          var callback, criteria, e;
          _this.received(request, response);
          criteria = {
            url: extractUrl(request.url),
            method: request.method,
            post: data,
            headers: request.headers,
            query: extractQuery(request.url)
          };
          callback = function(err, endpointResponse) {
            if (err) {
              _this.writeHead(response, 404, {});
              _this.responded(404, request.url, 'is not a registered endpoint');
            } else {
              _this.writeHead(response, endpointResponse.status, endpointResponse.headers);
              response.write(endpointResponse.body);
              _this.responded(endpointResponse.status, request.url);
            }
            return response.end();
          };
          try {
            return _this.Endpoints.find(criteria, callback);
          } catch (_error) {
            e = _error;
            response.statusCode = 500;
            _this.responded(500, request.url, "unexpectedly generated a server error: " + e.message);
            return response.end();
          }
        };
      })(this));
    };

    return Stubs;

  })(Portal);

  extractUrl = function(url) {
    return url.replace(/(.*)\?.*/, '$1');
  };

  extractQuery = function(url) {
    return qs.parse(url.replace(/^.*\?(.*)$/, '$1'));
  };

}).call(this);
