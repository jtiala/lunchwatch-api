import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/index';
import bookshelf from '../../src/db';

/**
 * Tests for '/v1/restaurants'
 */
describe('Restaurants Controller Test', () => {
  before((done) => {
    bookshelf
      .knex('restaurants')
      .truncate()
      .then(() => done());
  });

  it('should return list of restaurants', (done) => {
    request(app)
      .get('/v1/restaurants')
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.data).to.be.an('array');
        expect(res.body.data).to.have.lengthOf(0);

        done();
      });
  });

  it('should respond with not found error if random restaurant id is provided', (done) => {
    request(app)
      .get('/v1/restaurants/1991')
      .end((err, res) => {
        const { code, message } = res.body.error;

        expect(res.statusCode).to.be.equal(404);
        expect(code).to.be.equal(404);
        expect(message).to.be.equal('Restaurant not found');

        done();
      });
  });
});
