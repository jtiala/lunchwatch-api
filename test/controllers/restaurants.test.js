import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/index';
import bookshelf from '../../src/db';

/**
 * Tests for '/v1/restaurants'
 */
describe('Restaurants Controller Test', () => {
  before(done => {
    bookshelf
      .knex('restaurants')
      .truncate()
      .then(() => done());
  });

  it('should return list of restaurants', done => {
    request(app)
      .get('/v1/restaurants')
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.data).to.be.an('array');
        expect(res.body.data).to.have.lengthOf(0);

        done();
      });
  });

  it('should not create a new restaurant if name is not provided', done => {
    let restaurant = {
      noname: 'Restaurant 1'
    };

    request(app)
      .post('/v1/restaurants')
      .send(restaurant)
      .end((err, res) => {
        let { code, message, details } = res.body.error;

        expect(res.statusCode).to.be.equal(400);
        expect(code).to.be.equal(400);
        expect(message).to.be.equal('Bad Request');
        expect(details).to.be.an('array');
        expect(details[0]).to.have.property('message');
        expect(details[0]).to.have.property('param', 'name');

        done();
      });
  });

  it('should create a new restaurant with valid data', done => {
    let restaurant = {
      name: 'Restaurant 1'
    };

    request(app)
      .post('/v1/restaurants')
      .send(restaurant)
      .end((err, res) => {
        let { data } = res.body;

        expect(res.statusCode).to.be.equal(201);
        expect(data).to.be.an('object');
        expect(data).to.have.property('id');
        expect(data).to.have.property('name');
        expect(data).to.have.property('createdAt');
        expect(data).to.have.property('updatedAt');
        expect(data.name).to.be.equal(restaurant.name);

        done();
      });
  });

  it('should get information of restaurant', done => {
    request(app)
      .get('/v1/restaurants/1')
      .end((err, res) => {
        let { data } = res.body;

        expect(res.statusCode).to.be.equal(200);
        expect(data).to.be.an('object');
        expect(data).to.have.property('id');
        expect(data).to.have.property('name');
        expect(data).to.have.property('createdAt');
        expect(data).to.have.property('updatedAt');

        done();
      });
  });

  it('should respond with not found error if random restaurant id is provided', done => {
    request(app)
      .get('/v1/restaurants/1991')
      .end((err, res) => {
        let { code, message } = res.body.error;

        expect(res.statusCode).to.be.equal(404);
        expect(code).to.be.equal(404);
        expect(message).to.be.equal('Restaurant not found');

        done();
      });
  });

  it('should update a restaurant if name is provided', done => {
    let restaurant = {
      name: 'Restaurante 1'
    };

    request(app)
      .put('/v1/restaurants/1')
      .send(restaurant)
      .end((err, res) => {
        let { data } = res.body;

        expect(res.statusCode).to.be.equal(200);
        expect(data).to.be.an('object');
        expect(data).to.have.property('id');
        expect(data).to.have.property('name');
        expect(data).to.have.property('createdAt');
        expect(data).to.have.property('updatedAt');
        expect(data.name).to.be.equal(restaurant.name);

        done();
      });
  });

  it('should not update a restaurant if name is not provided', done => {
    let restaurant = {
      noname: 'Restaurante 1'
    };

    request(app)
      .put('/v1/restaurants/1')
      .send(restaurant)
      .end((err, res) => {
        let { code, message, details } = res.body.error;

        expect(res.statusCode).to.be.equal(400);
        expect(code).to.be.equal(400);
        expect(message).to.be.equal('Bad Request');
        expect(details).to.be.an('array');
        expect(details[0]).to.have.property('message');
        expect(details[0]).to.have.property('param', 'name');

        done();
      });
  });

  it('should delete a restaurant if valid id is provided', done => {
    request(app)
      .delete('/v1/restaurants/1')
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(204);

        done();
      });
  });

  it('should respond with not found error if random restaurant id is provided for deletion', done => {
    request(app)
      .delete('/v1/restaurants/1991')
      .end((err, res) => {
        let { code, message } = res.body.error;

        expect(res.statusCode).to.be.equal(404);
        expect(code).to.be.equal(404);
        expect(message).to.be.equal('Restaurant not found');

        done();
      });
  });

  it('should respond with bad request for empty JSON in request body', done => {
    let restaurant = {};

    request(app)
      .post('/v1/restaurants')
      .send(restaurant)
      .end((err, res) => {
        let { code, message } = res.body.error;

        expect(res.statusCode).to.be.equal(400);
        expect(code).to.be.equal(400);
        expect(message).to.be.equal('Empty JSON');

        done();
      });
  });
});
