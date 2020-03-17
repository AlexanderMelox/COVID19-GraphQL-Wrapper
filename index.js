const { ApolloServer, gql } = require('apollo-server');

const apiURL = 'https://covid19.mathdro.id/api';

async function start() {
  const typeDefs = gql`
    type Confirmed {
      hello: String!
    }

    type Query {
      allConfirmed: [Confirmed!]!
    }
  `;

  const resolvers = {
    Query: {
      hello() {
        return {
          hello: 'Hello, world!',
        };
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await server.listen();
  console.log(`🚀 GraphQL Server is running on ${url}`);
}

start();
