'use strict';

const chai = require('chai');
const expect = chai.expect;
const Promise = require('bluebird');
const cp = Promise.promisifyAll(require('child_process'));

it.optional = require('it-optional');

// Dependencies tests
describe('Check requirements', function () {
  this.timeout(15000);
  it('Should be able to use sudo without error', function () {
    return cp.execAsync('sudo service --status-all').then((stdout, stderr) => {
      if (stdout && stdout.includes('[')) return Promise.resolve();
      return Promise.reject(new Error('Cannot access sudo or services, maybe your are not on debian/ubuntu'));
    });
  });

  it('Should have apache2 in the status list', function () {
    return cp.execAsync('sudo service --status-all').then((stdout, stderr) => {
      if (stdout && stdout.includes('apache2')) return Promise.resolve();
      return Promise.reject(new Error('Is Apache2 installed ?'));
    });
  });

  it('Should not be able to access Apache2 because it does not exists dude ..', function () {
    return cp.execAsync('sudo service --status-all').then((stdout, stderr) => {
      if (stdout && stdout.includes('apache3')) return Promise.reject(new Error('Apache3 is running.. the program have a big mistake'));
    });
  });
});

describe('Check Class', function () {
  this.timeout(15000);
  it('Should restart apache2 if it is not started', function () {
    const CheckingServices = require('../check.js');
    let check = new CheckingServices();
    // first stop apache
    cp.execSync('sudo service apache2 stop');
    return cp.execAsync('sudo service apache2 status', function (stdout, stderr) {
      expect(stdout).to.include('dead');
      expect(stdout).to.not.include('running');
      check.apache2();
    }).delay(1000).then(() => {
      // Simulate an apache restart
      return cp.execAsync('sudo service apache2 status', function (stdout, stderr) {
        expect(stdout).to.include('running');
        expect(stdout).to.not.include('dead');
        check.apache2();
      });
    });
  });
});
