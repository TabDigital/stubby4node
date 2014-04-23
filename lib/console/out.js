(function() {
  var BLACK, BLUE, BOLD, CYAN, GREEN, MAGENTA, RED, RESET, YELLOW;

  require('./colorsafe')(console);

  BOLD = '\x1B[1m';

  BLACK = '\x1B[30m';

  BLUE = '\x1B[34m';

  CYAN = '\x1B[36m';

  GREEN = '\x1B[32m';

  MAGENTA = '\x1B[35m';

  RED = '\x1B[31m';

  YELLOW = '\x1B[33m';

  RESET = '\x1B[0m';

  module.exports = {
    mute: false,
    log: function(msg) {
      if (this.mute) {
        return;
      }
      return console.log(msg);
    },
    status: function(msg) {
      if (this.mute) {
        return;
      }
      return console.log("" + BOLD + BLACK + msg + RESET);
    },
    dump: function(data) {
      if (this.mute) {
        return;
      }
      return console.dir(data);
    },
    info: function(msg) {
      if (this.mute) {
        return;
      }
      return console.info("" + BLUE + msg + RESET);
    },
    ok: function(msg) {
      if (this.mute) {
        return;
      }
      return console.log("" + GREEN + msg + RESET);
    },
    error: function(msg) {
      if (this.mute) {
        return;
      }
      return console.error("" + RED + msg + RESET);
    },
    warn: function(msg) {
      if (this.mute) {
        return;
      }
      return console.warn("" + YELLOW + msg + RESET);
    },
    incoming: function(msg) {
      if (this.mute) {
        return;
      }
      return console.log("" + CYAN + msg + RESET);
    },
    notice: function(msg) {
      if (this.mute) {
        return;
      }
      return console.log("" + MAGENTA + msg + RESET);
    },
    trace: function() {
      if (this.mute) {
        return;
      }
      console.log(RED);
      console.trace();
      return console.log(RESET);
    }
  };

}).call(this);
