LunchWatch Menu Aggregator API
==============================

## Production

Copy .env-file for production and edit in your configs

    cp .env .env.production

Migrate and seed the database

    NODE_ENV=production yarn migrate
    NODE_ENV=production yarn seed

Install, build and start

    yarn install
    yarn start

## Development

Start containers with [docker-compose](https://docs.docker.com/compose/):

    docker-compose up

Connect to the web container:

    docker exec -it lunchwatchapi_web_1 /bin/bash

Run migrations and seed the database with some initial data:

    yarn migrate
    yarn seed

Navigate to http://localhost:8848/api-docs/ to verify application is running from docker.

### Creating new migrations and seeds

These are the commands to create a new migration and corresponding seed file. The commands should be
ran inside the container.

    yarn make:migration <name>
    yarn make:seeder <name>

For example

    yarn make:migration create_restaurants_table
    yarn make:seeder 01_01_insert_oulu_restaurants

### Testing

To run tests, connect to the container and run tests with:

    docker exec -it lunchwatchapi_web_1 /bin/bash
    yarn test

Run tests with coverage with:

    yarn test:coverage

## License

[MIT](LICENSE)
