const abbrev = require("./plugins/abbrev.js");
const renderEmoji = require("./plugins/renderEmoji.js");
const convertAbbrev = require("./plugins/convertAbbrev");

module.exports = class Util {
  static toAbbrev(num) { 
    return abbrev(num);
  } 
  static renderEmoji(ctx, msg, x, y) { 
    return renderEmoji(ctx, msg, x, y); 
  }
  static notAbbrev(num) { 
    return convertAbbrev(num);
  }
  static format(millis) {
    millis = Math.round(millis / 1000)
    const s = millis % 60,
      m = ~~((millis / 60) % 60),
      h = ~~(millis / 60 / 60);

    return h === 0
      ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(Math.abs(h) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  static msToDate(time) {
    time = Math.round(time / 1000)
    const s = time % 60,
      m = ~~((time / 60) % 60),
      h = ~~((time / 60 / 60) % 24),
      d = ~~(time / 60 / 60 / 24);

    return `${d}d:${h}h:${m}m:${s}s`;
  }

  static duration(duration, useMilli = false) {
    let remain = duration;
    let days = Math.floor(remain / (1000 * 60 * 60 * 24));
    remain = remain % (1000 * 60 * 60 * 24);
    let hours = Math.floor(remain / (1000 * 60 * 60));
    remain = remain % (1000 * 60 * 60);
    let minutes = Math.floor(remain / (1000 * 60));
    remain = remain % (1000 * 60);
    let seconds = Math.floor(remain / (1000));
    remain = remain % (1000);
    let milliseconds = remain;
    let time = {
      days,
      hours,
      minutes,
      seconds,
      milliseconds
    };
    let parts = []
    if (time.days) {
      let ret = time.days + ' Dia'
      if (time.days !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (time.hours) {
      let ret = time.hours + ' Hora'
      if (time.hours !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (time.minutes) {
      let ret = time.minutes + ' Minuto'
      if (time.minutes !== 1) {
        ret += 's'
      }
      parts.push(ret)

    }
    if (time.seconds) {
      let ret = time.seconds + ' Segundo'
      if (time.seconds !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (useMilli && time.milliseconds) {
      let ret = time.milliseconds + ' ms'
      parts.push(ret)
    }
    if (parts.length === 0) {
      return ['instantly']
    } else {
      return parts
    }
  }
};