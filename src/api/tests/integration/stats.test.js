/* eslint-disable arrow-body-style */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../../../index');

describe('GET /v1/stats/moderation/approved', () => {
  it('Should return a 200 response with the approved posts or empty if none', () => {
    return request(app)
      .get('/v1/stats/moderation/approved')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});

describe('GET /v1/stats/moderation/moderated', () => {
  it('Should return a 200 response with the moderated posts or empty if none', () => {
    return request(app)
      .get('/v1/stats/moderation/moderated')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});

describe('GET /v1/stats/moderation/not-approved', () => {
  it('Should return a 200 response with the not approved posts or empty if none', () => {
    return request(app)
      .get('/v1/stats/moderation/not-approved')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});

describe('GET /v1/stats/moderation/pending', () => {
  it('Should return a 200 response with the pending posts or empty if none', () => {
    return request(app)
      .get('/v1/stats/moderation/pending')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});

describe('GET /v1/stats/moderation/reserved', () => {
  it('Should return a 200 response with the reserved posts or empty if none', () => {
    return request(app)
      .get('/v1/stats/moderation/reserved')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});
