(function() {
  var CLI, Portal, http, out;

  CLI = require('../console/cli');

  out = require('../console/out');

  http = require('http');

  module.exports.Portal = Portal = (function() {
    function Portal() {
      this.name = 'portal';
    }

    Portal.prototype.writeHead = function(response, status_code, headers) {
      if (!response.headersSent) {
        response.writeHead(status_code, headers);
      }
      return response;
    };

    Portal.prototype.received = function(request, response) {
      var date, hours, minutes, seconds;
      date = new Date();
      hours = ("0" + (date.getHours())).slice(-2);
      minutes = ("0" + (date.getMinutes())).slice(-2);
      seconds = ("0" + (date.getSeconds())).slice(-2);
      out.incoming("" + hours + ":" + minutes + ":" + seconds + " -> " + request.method + " " + this.name + request.url);
      response.setHeader('Server', "stubby/" + (CLI.version()) + " node/" + process.version + " (" + process.platform + " " + process.arch + ")");
      if (request.headers['origin'] != null) {
        response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
        response.setHeader('Access-Control-Allow-Credentials', true);
        if (request.headers['access-control-request-headers'] != null) {
          response.setHeader('Access-Control-Allow-Headers', request.headers['access-control-request-headers']);
        }
        if (request.headers['access-control-request-method'] != null) {
          response.setHeader('Access-Control-Allow-Methods', request.headers['access-control-request-method']);
        }
      }
      return response;
    };

    Portal.prototype.responded = function(status, url, message) {
      var date, fn, hours, minutes, seconds;
      if (url == null) {
        url = '';
      }
      if (message == null) {
        message = http.STATUS_CODES[status];
      }
      date = new Date();
      hours = ("0" + (date.getHours())).slice(-2);
      minutes = ("0" + (date.getMinutes())).slice(-2);
      seconds = ("0" + (date.getSeconds())).slice(-2);
      fn = 'log';
      switch (false) {
        case !((600 > status && status >= 400)):
          fn = 'error';
          break;
        case !(status >= 300):
          fn = 'warn';
          break;
        case !(status >= 200):
          fn = 'ok';
          break;
        case !(status >= 100):
          fn = 'info';
      }
      return out[fn]("" + hours + ":" + minutes + ":" + seconds + " <- " + status + " " + this.name + url + " " + message);
    };

    return Portal;

  })();

}).call(this);
