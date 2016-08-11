var prompt = require('prompt');
var request = require('ajax-request');
var helpers = require('./helpers.js');
var apiKey = 'kk3bsqykcspm8ua26p453jpz';
var schema = {
  properties: {
    product: {
      message: 'Enter product name',
      required: true
    }
  }
};

var pingProductApi = function(result, apiKey, callback, url) {
   request({
      url: url||'http://api.walmartlabs.com/v1/search?apiKey='+apiKey+'&query='+result.product,
      method: 'GET',
    }, callback);
};

var pingRecommendationApi = function(err, res, body, api, callback, url) {
  if (err){
    console.log(err);
    return err;
  }
  var body = JSON.parse(body);
  if (body.message) {
    console.log(body.message);
    return body.message;
  };
  var itemId = body.items[0].itemId;
  request({
    url: url||'http://api.walmartlabs.com/v1/nbp?apiKey='+apiKey+'&itemId='+itemId,
    method: 'GET',
  }, callback);
};

var sortRecommendations = function(err, res, body) {
  if (err) {
    console.log('error with the recommendation api');
    return err;
  };
  var body=JSON.parse(body);
  if (body.errors){
    console.log('no reccomendations');
    console.log(body.errors[0].message);
    return body.errors[0].message;
  } 
  var firstTen=body.slice(0, 10).sortByKey('customerRating', 'dsc');
  firstTen.each(function(item){
    console.log('name: '+item.name+' rating: ', item.customerRating);
  });
  return firstTen;
}


var getRecProducts= function(schema){
  prompt.start();
  prompt.get(schema, function (err, result) {
    if (err) {
      console.log('err is ', err);
      return err;
    }
    pingProductApi(result, apiKey, function(err, res, body) {
      pingRecommendationApi(err, res, body, apiKey,  sortRecommendations);
    }); 
  });
};

getRecProducts(schema);

module.exports = {
  pingProductApi: pingProductApi,
  pingRecommendationApi, pingRecommendationApi,
  sortRecommendations, sortRecommendations,
  getRecProducts, getRecProducts
};


