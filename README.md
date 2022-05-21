# mtginv

An MTG inventory manager uniquely oriented around curating your physical collection of cards. Mtginv makes it as easy as possible to record what you have, and then find it later, no matter if you have a couple decks or tens of thousands of cards.

## Contributing

### Setup

This uses [Remix](https://remix.run/).

1. Clone the repository, and run `npm install`
1. Copy `.env.example` to `.env`.
    1. Create an [Auth0](https://auth0.com/) web application and fill in the AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET in the `.env` file. Set its callback URL to `http://localhost:3000/auth/auth0/callback` and allowed web origins and CORS to `http://localhost:3000`.
1. Run `docker run --name mtg-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres` to create and start a Postgres database.

    Optional: Run `docker run -p 5433:80 -e PGADMIN_DEFAULT_PASSWORD=admin -e PGADMIN_DEFAULT_EMAIL=connor@peet.io -d dpage/pgadmin4` to have a pgadmin interface on `localhost:5433`

1. Run `npx prisma db push` to migrate the database.
1. Run `npm run dev` to start!
