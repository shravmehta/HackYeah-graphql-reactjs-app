const {buildSchema} = require('graphql');

module.exports = buildSchema(`
type Event {
    _id: ID!
    title: String!
    description: String!
    fees: Float!
    date: String!
    creator: User!
}

type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
}

type Auth {
    userId: ID!
    token: String!
    tokenExpire: Int!
}

type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}

input EventInput {
    title: String!
    description: String!
    fees: Float!
    date: String!
}

input UserInput {
    email: String!
    password: String!
}

type RootQuery {
    events: [Event!]!
    bookings: [Booking!]!
    login(email: String!, password: String!): Auth
}

type RootMutation {
    createEvent(eventInput: EventInput): Event
    addUser(userInput: UserInput): User
    registerEvent(eventID: ID!): Booking!
    cancelRegisteration(bookingId: ID!): Event!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`)