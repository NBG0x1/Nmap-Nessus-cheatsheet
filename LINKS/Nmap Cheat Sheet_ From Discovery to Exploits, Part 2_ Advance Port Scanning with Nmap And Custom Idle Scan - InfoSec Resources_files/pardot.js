(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  'use strict';
  
    var Throttle = function(fn, threshhold, scope) {
      threshhold || (threshhold = 250);
      var last,
          deferTimer;
      return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    };
    
    module.exports = Throttle;
    
})();
},{}],2:[function(require,module,exports){
document.domain = 'infosecinstitute.com';

(function() {
  'use strict';
  
  document.addEventListener("DOMContentLoaded", function() {
  
    var throttle = require('./helpers/throttle');
    var iframe  = window.parent.document.querySelector('iframe[src="' + document.URL + '"]');
    
    var handleIFrame = function() {
      var h = document.body.offsetHeight;
      iframe.height = h;
      iframe.scrolling = 'no';
    };
    
    if(iframe) {
      
      window.addEventListener('load', handleIFrame);
      
      window.addEventListener('resize', throttle(handleIFrame, 100));
      
    }
    
  });

})();
},{"./helpers/throttle":1}]},{},[2]);
