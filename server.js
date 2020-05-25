const { ApolloServer, gql } = require('apollo-server');
const GraphQLLong = require('graphql-type-long');
const axios = require('axios');
const moment = require('moment');
const { urls } = require('./utils');
const { Case } = require('./models');

function getAllCases() {
  return axios.get(urls.cases);
}

function getBaseData() {
  return axios.get(urls.base);
}

async function start() {
  const typeDefs = gql`
    scalar Long

    enum DateFormats {
      FULL_DATE
      SINCE_LAST_UPDATED
      DEFAULT
    }

    type Meta {
      image: String!
      githubRepo: String!
      lastUpdate: String!
    }

    type Stats {
      confirmed: Int!
      recovered: Int!
      deaths: Int!
    }

    type Case {
      provinceState: String
      countryRegion: String
      lastUpdate: String
      lat: Float
      long: Float
      confirmed: Int
      recovered: Int
      deaths: Int
      iso2: String
      iso3: String
    }

    type Country {
      name: String!
      iso2: String
      iso3: String
    }

    type Query {
      allCases: [Case!]!
      case(countryRegion: String!): Case!
      stats: Stats!
      meta(format: DateFormats): Meta!
      lastUpdate: String!
      allCountries: [Country!]!
    }
  `;

  const resolvers = {
    Query: {
      async allCases() {
        const cases = await Case.getAllCases();  
        return cases;
      },
      async case(_, { countryRegion }) {
        const allCases = await getAllCases();

        const foundCaseByRegion = allCases.data.find(
          c => c.countryRegion === countryRegion
        );

        return foundCaseByRegion;
      },
      async stats() {
        const { data } = await getBaseData();
        const stats = {
          confirmed: data.confirmed.value,
          recovered: data.recovered.value,
          deaths: data.deaths.value,
        };
        return stats;
      },
      async meta(_, { format }) {
        const { data } = await getBaseData();
        const now = moment();
        let lastUpdate;

        switch (format) {
          case 'FULL_DATE':
            lastUpdate = moment(data.lastUpdate).format(
              'dddd, MMMM Do YYYY, h:mm:ss a'
            );
            break;
          case 'SINCE_LAST_UPDATED':
            lastUpdate = now.from(moment(data.lastUpdate));
            break;
          default:
            lastUpdate = data.lastUpdate;
        }

        const meta = {
          image: data.image,
          githubRepo: data.source,
          lastUpdate,
        };
        return meta;
      },
      async lastUpdate() {
        const { data } = await getBaseData();
        const now = moment();
        return now.from(data.lastUpdate);
      },
      async allCountries() {
        const { data: { countries } } = await axios.get(urls.countries);

        return countries;
      }
    },
    Long: GraphQLLong,
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await server.listen();
  console.log(`🚀 GraphQL Server is running on ${url}`);
}

start();
