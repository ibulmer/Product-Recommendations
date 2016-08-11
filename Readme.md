#About
  This is command line program to find recommended products. It can be thought of as a series of as a series of steps.
  1. User is prompted for input.
  2. This input is used to ping the Walmart product api. This api returns an array of products.
  3. The id of the first product is used to ping the recommendations api. This api returns an array of product recommendations.
  4. An array of the first 10 recommendatiions retrieved are sorted based on user rating and then returned. 

Prerequisites: Have node installed. Please visit https://nodejs.org for instructions.


#Build
 From the root of the directory type: 
```sh
$ npm start
```
  This does 3 things:
  1. invokes npm install which installs the dependencies specified in the package.json file
  2. invokes npm test which runs the test script
  3. invokes npm start which runs node main.js the script that runs the program

Alternatively you can invoke any one of these 3 processes in isolation. From the root of the directory.

install
 ```sh
$ npm install
'''
Tests: '''
$ npm test
'''
Start Program: '''
$ node main.js
'''

#Testing
The tests both test the helper functions as well as the functions that call the apis. The apis are mocked using Nock. Nock works by intercepting http requests and returning whatever you decide. To learn more go to https://github.com/node-nock/nock