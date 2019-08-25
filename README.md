# 🍱 LunchWatch Menu Aggregator API

[![Actions Status][actions-status-badge]][actions-status]
[![Dependencies Status][dependencies-status-badge]][dependencies-status]
[![Dev Dependencies Status][devdependencies-status-badge]][devdependencies-status]
[![PRs Welcome][prs-badge]][contributing]
[![License][license-badge]](license)

[LunchWatch][lunchwatch] is a lunch menu aggregator web app. The app is currently aggregating menus from restaurants in Oulu, Finland.

This repository contains Node.js [GraphQL][graphql] and REST APIs, and also includes scheduled menu importers. The actual web app is located in a [separate repository][lunchwatch-pwa-repo]. Issues concerning the UI should be discussed in that repository.

## Pre-requisites

- [Git][git]
- [Node][node]
- [Docker][docker]

## Development

Duplicate `.env.example` as `.env` and edit in your details

    cp .env.example .env

Start containers

    docker-compose up

Run migrations and seed the database with some initial data

    docker exec -d lunchwatch-api_api_1 npm run migrate
    docker exec -d lunchwatch-api_api_1 npm run seed

Navigate to http://localhost:8080/graphql to verify application is running.

## Production

Make sure you have [browserless/chrome][chrome] Docker container or similar instance of headless Chromium running and accepting websocket connection at URI defined in `CHROME_WS_ENDPOINT` environment variable.

Duplicate `.env.example` as `.env` and edit in your details

    cp .env.example .env

Install and build

    npm install
    npm run build

Migrate and seed the database

    npm run migrate
    npm run seed

Start the app

    npm run start

## Creating new migrations and seeds

The project uses [Knex][knex] for query building and database migrations. New migrations and and seeds can be created with these commands.

    docker exec -d lunchwatch-api_api_1 npm run migrate:make <name>
    docker exec -d lunchwatch-api_api_1 npm run seed:make <name>

For example

    docker exec -d lunchwatch-api_api_1 npm run migrate:make create_restaurants_table
    docker exec -d lunchwatch-api_api_1 npm run seed:make uniresta_seeds

## Contributing

Contributions are most welcome! If you would like to contribute to this project, please discuss the changes you want to make in the [project's issues][issues] first!

## License

This project is open source software licensed under the MIT license. For more information see [LICENSE][license].

[actions-status]: https://github.com/jtiala/lunchwatch-pwa/actions
[actions-status-badge]: https://github.com/jtiala/lunchwatch-pwa/workflows/CI/CD/badge.svg
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
[docker]: https://www.docker.com/
[graphql]: https://graphql.org/
[knex]: http://knexjs.org/
[chrome]: https://hub.docker.com/r/browserless/chrome
[issues]: https://github.com/jtiala/lunchwatch-api/issues
[lunchwatch]: https://lunch.watch/
[lunchwatch-pwa-repo]: https://github.com/jtiala/lunchwatch-pwa
