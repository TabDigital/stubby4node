(function() {
  var Admin, Portal, contract, http, ns, path, status,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  contract = require('../models/contract');

  Portal = require('./portal').Portal;

  http = require('http');

  ns = require('node-static');

  path = require('path');

  status = new ns.Server(path.resolve(__dirname, '../../webroot'));

  module.exports.Admin = Admin = (function(_super) {
    __extends(Admin, _super);

    function Admin(endpoints) {
      this.server = __bind(this.server, this);
      this.endpoints = endpoints;
      this.contract = contract;
      this.name = '[admin]';
    }

    Admin.prototype.urlPattern = /^\/([1-9][0-9]*)?$/;

    Admin.prototype.goPong = function(response) {
      this.writeHead(response, 200, {
        'Content-Type': 'text/plain'
      });
      return response.end('pong');
    };

    Admin.prototype.goPUT = function(request, response) {
      var data, id;
      id = this.getId(request.url);
      if (!id) {
        this.notSupported(response);
        return;
      }
      data = '';
      request.on('data', function(chunk) {
        return data += chunk;
      });
      return request.on('end', (function(_this) {
        return function() {
          return _this.processPUT(id, data, response);
        };
      })(this));
    };

    Admin.prototype.goPOST = function(request, response) {
      var data, id;
      id = this.getId(request.url);
      if (id) {
        return this.notSupported(response);
      }
      data = '';
      request.on('data', function(chunk) {
        return data += chunk;
      });
      return request.on('end', (function(_this) {
        return function() {
          return _this.processPOST(data, response, request);
        };
      })(this));
    };

    Admin.prototype.goDELETE = function(request, response) {
      var callback, id;
      id = this.getId(request.url);
      if (!id) {
        return this.notSupported(response);
      }
      callback = (function(_this) {
        return function(err) {
          if (err) {
            return _this.notFound(response);
          }
          return _this.noContent(response);
        };
      })(this);
      return this.endpoints["delete"](id, callback);
    };

    Admin.prototype.goGET = function(request, response) {
      var callback, id;
      id = this.getId(request.url);
      if (id) {
        callback = (function(_this) {
          return function(err, endpoint) {
            if (err) {
              return _this.notFound(response);
            }
            return _this.ok(response, endpoint);
          };
        })(this);
        return this.endpoints.retrieve(id, callback);
      } else {
        callback = (function(_this) {
          return function(err, data) {
            if (data.length === 0) {
              return _this.noContent(response);
            }
            return _this.ok(response, data);
          };
        })(this);
        return this.endpoints.gather(callback);
      }
    };

    Admin.prototype.processPUT = function(id, data, response) {
      var callback, e, errors;
      try {
        data = JSON.parse(data);
      } catch (_error) {
        e = _error;
        return this.badRequest(response);
      }
      errors = this.contract(data);
      if (errors) {
        return this.badRequest(response, errors);
      }
      callback = (function(_this) {
        return function(err) {
          if (err) {
            return _this.notFound(response);
          }
          return _this.noContent(response);
        };
      })(this);
      return this.endpoints.update(id, data, callback);
    };

    Admin.prototype.processPOST = function(data, response, request) {
      var callback, e, errors;
      try {
        data = JSON.parse(data);
      } catch (_error) {
        e = _error;
        return this.badRequest(response);
      }
      errors = this.contract(data);
      if (errors) {
        return this.badRequest(response, errors);
      }
      callback = (function(_this) {
        return function(err, endpoint) {
          return _this.created(response, request, endpoint.id);
        };
      })(this);
      return this.endpoints.create(data, callback);
    };

    Admin.prototype.ok = function(response, result) {
      this.writeHead(response, 200, {
        'Content-Type': 'application/json'
      });
      if (result != null) {
        return response.end(JSON.stringify(result));
      } else {
        return response.end();
      }
    };

    Admin.prototype.created = function(response, request, id) {
      this.writeHead(response, 201, {
        'Location': "" + request.headers.host + "/" + id
      });
      return response.end();
    };

    Admin.prototype.noContent = function(response) {
      response.statusCode = 204;
      return response.end();
    };

    Admin.prototype.badRequest = function(response, errors) {
      this.writeHead(response, 400, {
        'Content-Type': 'application/json'
      });
      return response.end(JSON.stringify(errors));
    };

    Admin.prototype.notSupported = function(response) {
      response.statusCode = 405;
      return response.end();
    };

    Admin.prototype.notFound = function(response) {
      this.writeHead(response, 404, {
        'Content-Type': 'text/plain'
      });
      return response.end();
    };

    Admin.prototype.saveError = function(response) {
      this.writeHead(response, 422, {
        'Content-Type': 'text/plain'
      });
      return response.end();
    };

    Admin.prototype.serverError = function(response) {
      this.writeHead(response, 500, {
        'Content-Type': 'text/plain'
      });
      return response.end();
    };

    Admin.prototype.urlValid = function(url) {
      return url.match(this.urlPattern) != null;
    };

    Admin.prototype.getId = function(url) {
      return url.replace(this.urlPattern, '$1');
    };

    Admin.prototype.server = function(request, response) {
      this.received(request, response);
      response.on('finish', (function(_this) {
        return function() {
          return _this.responded(response.statusCode, request.url);
        };
      })(this));
      if (request.url === '/ping') {
        return this.goPong(response);
      }
      if (/^\/(status|js|css)(\/.*)?$/.test(request.url)) {
        return status.serve(request, response);
      }
      if (this.urlValid(request.url)) {
        switch (request.method.toUpperCase()) {
          case 'PUT':
            return this.goPUT(request, response);
          case 'POST':
            return this.goPOST(request, response);
          case 'DELETE':
            return this.goDELETE(request, response);
          case 'GET':
            return this.goGET(request, response);
          default:
            return this.notSupported(response);
        }
      } else {
        return this.notFound(response);
      }
    };

    return Admin;

  })(Portal);

}).call(this);
