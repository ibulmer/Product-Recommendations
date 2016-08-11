Array.prototype.sortByKey = function sortByKey(key, dsc) {
  return this.sort(function(a, b) {
      var x = a[key]; 
      var y = b[key];
      if (dsc ==='dsc') {
        return (x === undefined && y === undefined ? 0 : (x < y) || x === undefined ? 1 : ((x > y) || y === undefined ? -1 : 0));
      }
      return (x === undefined && y === undefined ? 0 : (x < y) || x === undefined ? -1 : ((x > y) || y === undefined ? 1 : 0)); 
  });
};

module.exports = {
  'sortByKey': Array.prototype.sortByKey
};