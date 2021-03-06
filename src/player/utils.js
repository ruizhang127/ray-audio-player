export default {
  logger: {
    info: (msg) => {
      console.log(msg);
    },
    debug: (msg) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(msg);
      }
    },
  },

  parseDomain(url) {
    const relativePathReg = new RegExp(/^\/.*$/);
    const fullUrlReg = new RegExp(/^[a-zA-Z]{3,5}:\/\/(?!\.)([a-zA-Z.]+):[0-9]{2,4}\/.*$/);
    const urlReg = new RegExp(/^(?!\.)([a-zA-Z.]+):[0-9]{2,4}\/.*$/);
    const ipReg = new RegExp(/^([a-zA-Z]{3,5}:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):[0-9]{2,4}\/?.*$/);

    let domain = null;

    if (relativePathReg.test(url)) {
      return this.parseDomain(window.location.href);
    }

    if (url.match(fullUrlReg)) {
      [, domain] = url.match(fullUrlReg);
    }

    if (url.match(urlReg)) {
      [, domain] = url.match(urlReg);
    }

    if (url.match(ipReg)) {
      [,, domain] = url.match(ipReg);
    }

    return domain;
  },

  parseTime(timeValue) {
    const seconds = parseInt(timeValue, 10);
    const timeData = {
      hours: '00',
      minutes: '00',
      seconds: '00',
      hasHours: false,
    };
    let hourValue = 0;
    let minValue = 0;
    let secValue = 0;
    let resultString = '';

    if (seconds < 60) {
      timeData.minutes = '0';
      timeData.seconds = seconds > 9 ? seconds : `0${seconds}`;
    } else if (seconds < 3600) {
      secValue = seconds % 60;
      minValue = (seconds - secValue) / 60;
      // timeData.minutes = min > 9 ? min : `0${min}`;
      timeData.minutes = minValue;
      timeData.seconds = secValue > 9 ? secValue : `0${secValue}`;
    } else {
      hourValue = (seconds - (seconds % 3600)) / 3600;
      secValue = (seconds - hourValue * 3600) % 60;
      minValue = (seconds - hourValue * 3600 - secValue) / 60;
      // timeData.hours = hour > 9 ? hour : `0${hour}`;
      timeData.hours = hourValue;
      timeData.minutes = minValue > 9 ? minValue : `0${minValue}`;
      timeData.seconds = secValue > 9 ? secValue : `0${secValue}`;
      timeData.hasHours = true;
    }

    if (timeData.hasHours) {
      resultString = `${timeData.hours}:${timeData.minutes}:${timeData.seconds}`;
    } else {
      resultString = `${timeData.minutes}:${timeData.seconds}`;
    }

    return resultString;
  },

  calculateTime(hours, minutes, seconds) {
    const h = hours || 0;
    const m = minutes || 0;
    const s = seconds;

    if (!s) {
      return 0;
    }

    return (parseInt(h, 10) * 3600) + (parseInt(m, 10) * 60) + (parseInt(s, 10));
  },

  parseLRC(lrcString) {
    const lines = lrcString.split(/\n/);
    const parsedArray = [];
    const lineReg = new RegExp(/^ *\[(\d{1,2}:)?(\d{1,2}):(\d{1,2})\](.*)(\r\n|\r|\n)*$/);

    lines.forEach((l) => {
      if (!lineReg.test(l)) {
        return;
      }

      const lineArray = l.match(lineReg);
      const parsedLine = {
        time: this.calculateTime(lineArray[1], lineArray[2], lineArray[3]),
        content: lineArray[4],
      };

      parsedArray.push(parsedLine);
    });

    return parsedArray;
  },

  syncForeach(ary, handler) {
    ary.reduce(async (lastPromise, value, index) => {
      await lastPromise;
      return handler(value, index);
    }, Promise.resolve());
  },

};
