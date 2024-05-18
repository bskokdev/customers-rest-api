# Customer CRUD API

## Description

This project simulates simple CRUD operations using a `Customer` entity and SQLite database
using the [NestJS](https://docs.nestjs.com/) framework.

## Project Scope

- Database connection via [TypeORM](https://typeorm.io/)
- Database seeding using the [Faker](https://www.npmjs.com/package/@faker-js/faker) library
- CRUD operations on a database entity
- DTO and entity mappings
- HTTP requests interceptions via filters
- Request validation using pipes
- Unit testing using [Jest](https://jestjs.io/)
- Swagger API documentation

## Installation

Install dependencies via `pnpm`

```bash
pnpm install
```

or via `npm`

```bash
npm install
```

Create a `.env` file in the `/src` directory with the following variables

```dotenv
PORT=<PORT_NUMBER>
NODE_ENV=<ENVIRONMENT>
```

Available Variables

- PORT - The port on which the web server will run
- NODE_ENV - The environment for which the behaviour should be adjusted
    - development
    - production

Example

```dotenv
PORT=4000
NODE_ENV=development
```

Run via `pnpm`

```bash
pnpm run start 
```

or with a watch (live updates)

```bash
pnpm run start:dev 
```

## Tests

Running unit test is done with the following command

```bash
pnpm run test
```
