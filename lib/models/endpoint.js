(function() {
  var Endpoint, compareHashMaps, fs, http, matchRegex, normalizeEOL, out, path, pruneUndefined, purifyAuthorization, purifyBody, purifyHeaders, purifyRequest, purifyResponse, q, record, setFallbacks, url,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  path = require('path');

  http = require('http');

  url = require('url');

  q = require('querystring');

  out = require('../console/out');

  module.exports = Endpoint = (function() {
    function Endpoint(endpoint, datadir) {
      if (endpoint == null) {
        endpoint = {};
      }
      if (datadir == null) {
        datadir = process.cwd();
      }
      Object.defineProperty(this, 'datadir', {
        value: datadir
      });
      this.request = purifyRequest(endpoint.request);
      this.response = purifyResponse(this, endpoint.response);
    }

    Endpoint.prototype.matches = function(request) {
      var file, matches, post, _ref;
      matches = {};
      if (!(matches.url = matchRegex(this.request.url, request.url))) {
        return null;
      }
      if (!(matches.headers = compareHashMaps(this.request.headers, request.headers))) {
        return null;
      }
      if (!(matches.query = compareHashMaps(this.request.query, request.query))) {
        return null;
      }
      file = null;
      if (this.request.file != null) {
        try {
          file = fs.readFileSync(path.resolve(this.datadir, this.request.file), 'utf8');
        } catch (_error) {}
      }
      if (post = file || this.request.post) {
        if (!(matches.post = matchRegex(normalizeEOL(post), normalizeEOL(request.post)))) {
          return null;
        }
      }
      if (this.request.method instanceof Array) {
        if (_ref = request.method, __indexOf.call(this.request.method.map(function(it) {
          return it.toUpperCase();
        }), _ref) < 0) {
          return null;
        }
      } else {
        if (this.request.method.toUpperCase() !== request.method) {
          return null;
        }
      }
      return matches;
    };

    return Endpoint;

  })();

  record = function(me, urlToRecord) {
    var options, parsed, recorder, recording, _ref, _ref1;
    recording = {};
    parsed = url.parse(urlToRecord);
    options = {
      method: (_ref = me.request.method) != null ? _ref : 'GET',
      hostname: parsed.hostname,
      headers: me.request.headers,
      port: parsed.port,
      path: parsed.pathname + '?'
    };
    if (parsed.query != null) {
      options.path += parsed.query + '&';
    }
    if (me.request.query != null) {
      options.path += q.stringify(me.request.query);
    }
    recorder = http.request(options, function(res) {
      recording.status = res.statusCode;
      recording.headers = res.headers;
      recording.body = '';
      res.on('data', function(chunk) {
        return recording.body += chunk;
      });
      return res.on('end', function() {
        return out.notice("recorded " + urlToRecord);
      });
    });
    recorder.on('error', function(e) {
      return out.warn("error recording response " + urlToRecord + ": " + e.message);
    });
    recording.post = new Buffer((_ref1 = me.request.post) != null ? _ref1 : 0, 'utf8');
    if (me.request.file != null) {
      try {
        recording.post = fs.readFileSync(path.resolve(me.datadir, me.request.file));
      } catch (_error) {}
    }
    recorder.write(recording.post);
    recorder.end();
    return recording;
  };

  normalizeEOL = function(string) {
    return (string.replace(/\r\n/g, '\n')).replace(/\s*$/, '');
  };

  purifyRequest = function(incoming) {
    var outgoing, _ref;
    if (incoming == null) {
      incoming = {};
    }
    outgoing = {
      url: incoming.url,
      method: (_ref = incoming.method) != null ? _ref : 'GET',
      headers: purifyHeaders(incoming.headers),
      query: incoming.query,
      file: incoming.file,
      post: incoming.post
    };
    outgoing.headers = purifyAuthorization(outgoing.headers);
    outgoing = pruneUndefined(outgoing);
    return outgoing;
  };

  purifyResponse = function(me, incoming) {
    var outgoing, response, _i, _len;
    if (incoming == null) {
      incoming = [];
    }
    if (!(incoming instanceof Array)) {
      incoming = [incoming];
    }
    outgoing = [];
    if (incoming.length === 0) {
      incoming.push({});
    }
    for (_i = 0, _len = incoming.length; _i < _len; _i++) {
      response = incoming[_i];
      if (typeof response === 'string') {
        outgoing.push(record(me, response));
      } else {
        outgoing.push(pruneUndefined({
          headers: purifyHeaders(response.headers),
          status: parseInt(response.status) || 200,
          latency: parseInt(response.latency) || void 0,
          file: response.file,
          body: purifyBody(response.body)
        }));
      }
    }
    return outgoing;
  };

  purifyHeaders = function(incoming) {
    var outgoing, prop, value;
    outgoing = {};
    for (prop in incoming) {
      value = incoming[prop];
      outgoing[prop.toLowerCase()] = value;
    }
    return outgoing;
  };

  purifyAuthorization = function(headers) {
    var auth, _ref;
    if (!(headers != null ? headers.authorization : void 0)) {
      return headers;
    }
    auth = (_ref = headers.authorization) != null ? _ref : '';
    if (!auth.match(/:/)) {
      return headers;
    }
    headers.authorization = 'Basic ' + new Buffer(auth).toString('base64');
    return headers;
  };

  purifyBody = function(body) {
    if (body == null) {
      body = '';
    }
    if (typeof body === 'object') {
      return JSON.stringify(body);
    } else {
      return body;
    }
  };

  pruneUndefined = function(incoming) {
    var key, outgoing, value;
    outgoing = {};
    for (key in incoming) {
      value = incoming[key];
      if (value != null) {
        outgoing[key] = value;
      }
    }
    return outgoing;
  };

  setFallbacks = function(endpoint) {
    if (endpoint.request.file != null) {
      try {
        endpoint.request.post = fs.readFileSync(endpoint.request.file, 'utf8');
      } catch (_error) {}
    }
    if (endpoint.response.file != null) {
      try {
        return endpoint.response.body = fs.readFileSync(endpoint.response.file, 'utf8');
      } catch (_error) {}
    }
  };

  compareHashMaps = function(configured, incoming) {
    var headers, key, value;
    if (configured == null) {
      configured = {};
    }
    if (incoming == null) {
      incoming = {};
    }
    headers = {};
    for (key in configured) {
      value = configured[key];
      if (!(headers[key] = matchRegex(configured[key], incoming[key]))) {
        return null;
      }
    }
    return headers;
  };

  matchRegex = function(compileMe, testMe) {
    if (testMe == null) {
      testMe = '';
    }
    return testMe.match(RegExp(compileMe, 'm'));
  };

}).call(this);
