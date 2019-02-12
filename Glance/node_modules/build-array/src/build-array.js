var type = require('type-component');

module.exports = function(length, val){
  var arr = Array.apply(null, Array(length));

  if(type(val) === 'undefined'){
    return arr;
  }

  return arr.map(function(){
    return val
  });
};