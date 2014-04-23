(function() {
  var Watcher, contract, crypto, fs, interval, intervalId, out, watching, yaml,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  crypto = require('crypto');

  contract = require('../models/contract');

  out = require('./out');

  yaml = require('js-yaml');

  interval = 3000;

  intervalId = null;

  watching = false;

  module.exports = Watcher = (function() {
    function Watcher(endpoints, filename) {
      this.refresh = __bind(this.refresh, this);
      var extension, shasum;
      this.endpoints = endpoints;
      this.filename = filename;
      this.parser = yaml.load;
      extension = filename.replace(/^.*\.([a-zA-Z0-9]+)$/, '$1');
      if (extension === 'json') {
        this.parser = JSON.parse;
      }
      shasum = crypto.createHash('sha1');
      shasum.update(fs.readFileSync(this.filename, 'utf8'));
      this.sha = shasum.digest('hex');
      this.activate();
    }

    Watcher.prototype.deactivate = function() {
      watching = false;
      return clearInterval(intervalId);
    };

    Watcher.prototype.activate = function() {
      if (watching) {
        return;
      }
      watching = true;
      out.status("Watching for changes in " + this.filename + "...");
      return intervalId = setInterval(this.refresh, interval);
    };

    Watcher.prototype.refresh = function() {
      var data, e, errors, sha, shasum;
      shasum = crypto.createHash('sha1');
      data = fs.readFileSync(this.filename, 'utf8');
      shasum.update(data);
      sha = shasum.digest('hex');
      if (sha !== this.sha) {
        try {
          data = this.parser(data);
          errors = contract(data);
          if (errors) {
            out.error(errors);
          } else {
            this.endpoints.db = [];
            this.endpoints.create(data, (function() {}));
            out.notice("'" + this.filename + "' was changed. It has been reloaded.");
          }
        } catch (_error) {
          e = _error;
          out.warn("Couldn't parse '" + this.filename + "' due to syntax errors:");
          out.log(e.message);
        }
      }
      return this.sha = sha;
    };

    return Watcher;

  })();

}).call(this);
