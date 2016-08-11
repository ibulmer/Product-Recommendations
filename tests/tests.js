var chai = require('chai');
var assert = chai.assert;
var helpers = require('../helpers.js');
var main = require('../main.js');
var nock = require('nock');
var xboxes = [
  {name: "black xbox", itemId: 215}, 
  {name: "red xbox", itemId: 327},
  {name: "blue xbox", itemId: 905}
];
var ipods = [
  {name: "black ipod", itemId: 1131}, 
  {name: "red ipod", itemId: 1141},
  {name: "blue ipod", itemId: 9090}
];
var recommendedProducts = [
  {name: "wireless controller", customerRating:4.28}, 
  {name: "battery pack", customerRating: 2.55}, 
  {name: "rumble pack", customerRating:4.9}
];


describe('SortByKey', function() {
  var arrRiddle = [
      {type:'baby', legs:4},
      {type:'adult', legs:2},
      {type:'senior', legs:3}
    ];
  it('should sort from lowest to highest', function() {
    arrRiddle.sortByKey('legs');
    assert.equal(arrRiddle[0].type, 'adult');
    assert.equal(arrRiddle[1].type, 'senior');
    assert.equal(arrRiddle[2].type, 'baby');
  });
  it('should sort from highest to lowest if dsc parameter is passed', function() {
    arrRiddle.sortByKey('legs', 'dsc');
    assert.equal(arrRiddle[0].type, 'baby');
    assert.equal(arrRiddle[1].type, 'senior');
    assert.equal(arrRiddle[2].type, 'adult');
  });
  it('should treat undefined values as the smallest values', function(){
    var arr = [
      {value:95},
      {value:0},
      {value:undefined},
      {value:undefined},
      {value:1}
    ];
    arr.sortByKey('value');
    assert.equal(arr[0].value, undefined);
    assert.equal(arr[4].value, 95);
    arr.sortByKey('value', 'dsc');
    assert.equal(arr[0].value, 95);
    assert.equal(arr[4].value, undefined);
  })
});

describe('pingProductApi', function() {
  it("should pass an error message to the callback if the no products match the search result", function (done) {
    this.timeout(10000);          
    nock("http://products")
      .get('/nonExistantProduct')
      .reply(200, {
        "message": "Results not found!"
      });

    main.pingProductApi('2030 model car', 'apiKey', function(err, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(JSON.parse(body).message, "Results not found!");
      done();
    }, "http://products/nonExistantProduct");

  });
  it ("should pass an array of products to the callback if there is a match for the search results", function(done) {
    this.timeout(10000);
    nock("http://products")
      .get('/xbox')
      .reply(200, {
        items: xboxes
      });
    main.pingProductApi('xbox', 'apiKey', function(err, res, body) {
      var items = JSON.parse(body).items;
      assert.equal(res.statusCode, 200);
      assert.equal(items[0].itemId, 215);
      assert.equal(items[0].name, "black xbox");
      assert.equal(items[1].itemId, 327);
      assert.equal(items[1].name, "red xbox");
      assert.equal(items[2].itemId, 905);
      assert.equal(items[2].name, "blue xbox");
      done();
    }, "http://products/xbox");
  });
});

describe('pingRecommendationApi', function() {
  it ('should return error if it received an error', function(done) {
    this.timeout(10000);
    var error = 'recommendation api is down';
    assert.equal(main.pingRecommendationApi(error), 'recommendation api is down');
    done();
  });
  it ('should return an error message if there were not products', function(done) {
    var body = JSON.stringify({"query":"lskfdjsalfjk","sort":"relevance","responseGroup":"base","totalResults":0,"start":1,"numItems":0,"message":"Results not found!","facets":[]});
    this.timeout(10000);
    nock("http://recommendations")
      .get('/nonExistantProduct')
      .reply(200, body);
    var result = main.pingRecommendationApi(null, null, body, 'api', function(err, res, body){
      return;
    }, "http://recommendations/nonExistantProduct");
    assert.equal(result, "Results not found!");
    done();
  });
  it ('should pass along an error message if there were no recommendations found', function(done) {
    this.timeout(10000);
    var body = JSON.stringify({items: ipods});
    var result = JSON.stringify({"errors":[{"code":4022,"message":"No recommendations found for item 173927612"}]});
    nock("http://recommendations")
      .get('/ipod')
      .reply(200, result);
    main.pingRecommendationApi(null, null, body, 'api', function(err, res, body) {
        assert.equal(JSON.parse(body).errors[0].message, "No recommendations found for item 173927612");
        done();
    }, "http://recommendations/ipod");
  });
  it ('should pass along product recommendation array to callback if it exists', function(done) {
    this.timeout(1000);
    var body = JSON.stringify({items: xboxes});
    var result = JSON.stringify(recommendedProducts);
    nock("http://recommendations")
      .get('/157')
      .reply(200, result);
    main.pingRecommendationApi(null, null, body, 'api', function(err, res, body) {
      var body = JSON.parse(body);
      assert.equal(body[0].name, "wireless controller");
      assert.equal(body[0].customerRating, 4.28);
      done();
    }, "http://recommendations/157");
  });

  describe('sortRecommendations', function() {
    it ('should return error if an error was passed to it', function(done) {
      var error = "product recommendation api is down";
      var body = JSON.stringify(recommendedProducts);
      var result = main.sortRecommendations(error, null, body);
      assert.equal(result, "product recommendation api is down");
      done();
    });
    it ('should return an error message ', function(done) {
      var error = null
      var result = JSON.stringify({"errors":[{"code":4022,"message":"No recommendations found for item 173927612"}]});
      assert.equal(main.sortRecommendations(error, null, result), "No recommendations found for item 173927612");
      done();
    });
    it ('should sort recommendations if they exist', function(done) {
      var error = null;
      var result = main.sortRecommendations(error, null, JSON.stringify(recommendedProducts));
      assert.equal(result[0].name, 'rumble pack'); 
      assert.equal(result[1].name, 'wireless controller');
      assert.equal(result[2].name, 'battery pack');
      done();
    });
  });
});

