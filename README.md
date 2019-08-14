# 🍱 LunchWatch Menu Aggregator API

[![Build Status][build-status-badge]][build-status]
[![Dependencies Status][dependencies-status-badge]][dependencies-status]
[![Dev Dependencies Status][devdependencies-status-badge]][devdependencies-status]
[![PRs Welcome][prs-badge]][contributing]
[![License][license-badge]](license)

[LunchWatch][lunchwatch] is a lunch menu aggregator web app. The app is currently aggregating menus from restaurants in Oulu, Finland.

This repository contains Node.js [GraphQL][graphql] and REST APIs, and also includes scheduled menu importers. The actual web app is located in a [separate repository][lunchwatch-client-repo]. Issues concerning the UI should be discussed in that repository.

## Pre-requisites

- [Git][git]
- [Node][node]
- [Yarn][yarn]
- [Docker][docker]

## Development

Duplicate `.env.example` as `.env` and edit in your details

    cp .env.example .env

Start containers

    docker-compose up

Run migrations and seed the database with some initial data

    docker exec -d lunchwatch-api_api_1 yarn migrate
    docker exec -d lunchwatch-api_api_1 yarn seed

Navigate to http://localhost:8080/graphql to verify application is running.

## Production

Duplicate `.env.example` as `.env` and edit in your details

    cp .env.example .env

Migrate and seed the database

    NODE_ENV=production yarn migrate
    NODE_ENV=production yarn seed

Install, build and start

    yarn
    yarn build
    yarn start

## Creating new migrations and seeds

The project uses [Knex][knex] for query building and database migrations. New migrations and and seeds can be created with these commands.

    docker exec -d lunchwatch-api_api_1 yarn migrate:make <name>
    docker exec -d lunchwatch-api_api_1 yarn seed:make <name>

For example

    docker exec -d lunchwatch-api_api_1 yarn migrate:make create_restaurants_table
    docker exec -d lunchwatch-api_api_1 yarn seed:make uniresta_seeds

## Contributing

Contributions are most welcome! If you would like to contribute to this project, please discuss the changes you want to make in the [project's issues][issues] first!

## License

This project is open source software licensed under the MIT license. For more information see [LICENSE][license].

[build-status]: https://circleci.com/gh/jtiala/lunchwatch-api/tree/master
[build-status-badge]: https://circleci.com/gh/jtiala/lunchwatch-api/tree/master.svg?style=svg
[dependencies-status]: https://david-dm.org/jtiala/lunchwatch-api
[dependencies-status-badge]: https://img.shields.io/david/jtiala/lunchwatch-api.svg
[devdependencies-status]: https://david-dm.org/jtiala/lunchwatch-api?type=dev
[devdependencies-status-badge]: https://img.shields.io/david/dev/jtiala/lunchwatch-api.svg
[contributing]: #contributing
[prs-badge]: https://img.shields.io/badge/prs-welcome-blue.svg
[license]: https://github.com/jtiala/lunchwatch-api/blob/master/LICENSE
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[git]: https://git-scm.com/
[node]: https://nodejs.org/
[yarn]: https://yarnpkg.com/
[docker]: https://www.docker.com/
[graphql]: https://graphql.org/
[knex]: http://knexjs.org/
[issues]: https://github.com/jtiala/lunchwatch-api/issues
[lunchwatch]: https://lunch.watch/
[lunchwatch-client-repo]: https://github.com/jtiala/lunchwatch-client
