(function() {
  var Contract, httpMethods, messages, request, response,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = Contract = function(endpoint) {
    var e, each, errors, property, results;
    errors = [];
    if (typeof endpoint === 'string') {
      try {
        endpoint = JSON.parse(endpoint);
      } catch (_error) {
        e = _error;
        return [messages.json];
      }
    }
    if (endpoint instanceof Array) {
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = endpoint.length; _i < _len; _i++) {
          each = endpoint[_i];
          _results.push(Contract(each));
        }
        return _results;
      })();
      results = results.filter(function(result) {
        return result !== null;
      });
      if (results.length === 0) {
        return null;
      }
      return results;
    }
    if (!endpoint.request) {
      errors.push(messages.request.missing);
    } else {
      for (property in request) {
        errors.push(request[property](endpoint.request[property]));
      }
    }
    if (endpoint.response) {
      if (!(endpoint.response instanceof Array)) {
        endpoint.response = [endpoint.response];
      }
      endpoint.response.forEach(function(incoming) {
        var _results;
        _results = [];
        for (property in response) {
          _results.push(errors.push(response[property](incoming[property])));
        }
        return _results;
      });
    }
    errors = errors.filter(function(error) {
      return error !== null;
    });
    if (errors.length === 0) {
      errors = null;
    }
    return errors;
  };

  httpMethods = ['GET', 'PUT', 'POST', 'HEAD', 'PATCH', 'TRACE', 'DELETE', 'CONNECT', 'OPTIONS'];

  messages = {
    json: "An unparseable JSON string was supplied.",
    request: {
      missing: "'request' object is required.",
      url: "'request.url' is required.",
      query: {
        type: "'request.query', if supplied, must be an object."
      },
      method: "'request.method' must be one of " + httpMethods + ".",
      headers: {
        type: "'request.headers', if supplied, must be an object."
      }
    },
    response: {
      headers: {
        type: "'response.headers', if supplied, must be an object."
      },
      status: {
        type: "'response.status' must be integer-like.",
        small: "'response.status' must be >= 100.",
        large: "'response.status' must be < 600."
      },
      latency: {
        type: "'response.latency' must be integer-like."
      }
    }
  };

  request = {
    url: function(url) {
      if (!url) {
        return messages.request.url;
      }
      return null;
    },
    headers: function(headers) {
      if (!headers) {
        return null;
      }
      if (headers instanceof Array || typeof headers !== 'object') {
        return messages.request.headers.type;
      }
      return null;
    },
    method: function(method) {
      var each, _fn, _i, _len, _ref;
      if (!method) {
        return null;
      }
      if (!(method instanceof Array)) {
        if (_ref = method.toUpperCase(), __indexOf.call(httpMethods, _ref) >= 0) {
          return null;
        } else {
          return messages.request.method;
        }
      }
      _fn = function(each) {
        var _ref1;
        if (_ref1 = each.toUpperCase(), __indexOf.call(httpMethods, _ref1) < 0) {
          return messages.request.method;
        }
      };
      for (_i = 0, _len = method.length; _i < _len; _i++) {
        each = method[_i];
        _fn(each);
      }
      return null;
    },
    query: function(query) {
      if (!query) {
        return null;
      }
      if (query instanceof Array || typeof query !== 'object') {
        return messages.request.query.type;
      }
      return null;
    }
  };

  response = {
    status: function(status) {
      var parsed;
      if (!status) {
        return null;
      }
      parsed = parseInt(status);
      if (!parsed) {
        return messages.response.status.type;
      }
      if (parsed < 100) {
        return messages.response.status.small;
      }
      if (parsed >= 600) {
        return messages.response.status.large;
      }
      return null;
    },
    headers: function(headers) {
      if (!headers) {
        return null;
      }
      if (headers instanceof Array || typeof headers !== 'object') {
        return messages.response.headers.type;
      }
      return null;
    },
    latency: function(latency) {
      if (!latency) {
        return null;
      }
      if (!parseInt(latency)) {
        return messages.response.latency.type;
      }
      return null;
    }
  };

}).call(this);
