# HackYeah-graphql-reactjs-app
HackYeah is an hackathon registering platform where users can register for the event and reserve their place in the event. Developed the graphQL API using nodeJS, Express and implemented the frontend of the web application in ReactJS. Deployed the web application on AWS EC2 Instance and used MongoDB Atlas to store the data.

**URL and Installation details**
----
Download the API and go into the directory and write npm install and then write npm start
URL: localhost:3001/graphql

**Sample Calls**
----
```
* Create User:

 mutation {
            addUser(userInput: {email: "${email}", password: "${password}"}) {
              _id
              email
            }
          }
          
          
* display User details:

query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        }
          
          
* Create Event

mutation {
            createEvent(inputData: {title: "clthack", details: "charlotte hackathon", price: 99, date: "01-07-2020"}) {
              _id
              title
              details
              date
              price
               creator {
                _id
                email
              }
            }
          } 


* Show all events

   query {
            events {
              _id
              title
              details
              date
              price
              creator {
                _id
                email
              }
            }
          } 
          
