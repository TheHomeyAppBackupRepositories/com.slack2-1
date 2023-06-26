'use strict';

module.exports = class SlackUtil {

  /* A function that splits a string `limit` times and adds the remainder as a final array index.
  * > var a = 'convoluted.madeup.example';
  * > a.split('.', 1);
  * < ['convoluted']
  * // What I expected:
  * < ['convoluted', 'madeup.example']
  */
  static split(str, separator, limit) {
    str = str.split(separator);

    if (str.length > limit) {
      const ret = str.splice(0, limit);
      ret.push(str.join(separator));

      return ret;
    }

    return str;
  }

};
