/* eslint-disable arrow-body-style */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const app = require('../../../index');

describe('GET /v1/posts', () => {
  it('Should return a 200 response with the posts or not posts at all', () => {
    return request(app)
      .get('/v1/posts')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.results).to.be.an('array');
        expect(res.body.count).to.be.an('number');
      });
  });
});

describe('GET /v1/posts/:author/:permlink', () => {
  it('Should return a 200 response with the posts information', () => {
    return request(app)
      .get('/v1/posts/jaysermendez/knacksteem-api-more-friendly-endpoint-and-moderation-tools')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.id).to.be.an('number');
        expect(res.body.author).to.be.an('string');
      });
  });

  it('Should return a 404 response because this post does not exist', () => {
    return request(app)
      .get('/v1/posts/jaysermendez/aaaa-a-a-a--aa----aa')
      .expect(httpStatus.NOT_FOUND)
      .then((res) => {
        expect(res.body.code).to.be.an('number');
        expect(res.body.message).to.be.an('string');
      });
  });
});

describe('POST /v1/posts/create', () => {
  it('Should return a 400 response - Validation Error', () => {
    return request(app)
      .post('/v1/posts/create')
      .send({})
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body.code).to.be.an('number');
        expect(res.body.message).to.be.an('string');
      });
  });

  it('Should return a 401 response - Unauthorized access', () => {
    return request(app)
      .post('/v1/posts/create')
      .send({
        access_token: 'dasda02301d0k1d2929k2x92kk210sk120s1',
        permlink: 'test-test',
        category: 'test',
        tags: ['test', 'test2'],
      })
      .expect(httpStatus.UNAUTHORIZED)
      .then((res) => {
        expect(res.body.code).to.be.an('number');
        expect(res.body.message).to.be.an('string');
      });
  });
});
