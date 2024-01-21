const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
let connected = false;

const getVisits = async () => {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  return client.db('finbox').collection('visits');
}

const getProfiles = async () => {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  return client.db('finbox').collection('profiles');
}

const getMessages = async () => {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  return client.db('finbox').collection('messages');
}

exports.client = client
exports.getVisits = getVisits;
exports.getProfiles = getProfiles;
exports.getMessages = getMessages;
