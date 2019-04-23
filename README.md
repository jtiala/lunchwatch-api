# LunchWatch Menu Aggregator API

[LunchWatch](https://lunch.watch) is a lunch menu aggregator web app. The app is currently in development. During beta phase, the app aggregates menus from restaurants in Oulu, Finland.

This repository contains back-end functionality and menu importers. The actual web app is located in a [separate repository](https://github.com/jtiala/lunchwatch-client). Issues concerning UI should be discussed in that repository.

## Contributing

Contributions are most welcome! When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

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

    docker exec -it lunchwatch-api_web_1 /bin/bash

Run migrations and seed the database with some initial data:

    yarn migrate
    yarn seed

Navigate to http://localhost:8088/api-docs/ to verify application is running from docker.

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
