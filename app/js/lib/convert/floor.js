(function () {
  'use strict';

  function floor(value, isFloored) {
    isFloored = isFloored !== undefined ? isFloored : true;
    return isFloored ? Math.floor(value) : value;
  }

  module.exports = floor;

}());
