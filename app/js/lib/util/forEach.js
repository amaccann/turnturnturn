(function () {
  'use strict';

  function forEach(object, callback, scope) {
    var property;
    for (property in object) {
      if (object.hasOwnProperty(property)) {
        callback.call(scope, object[property], property);
      }
    }
  }

  module.exports = forEach;

}());
