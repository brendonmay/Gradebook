module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '159.203.17.199',
      username: 'root',
      // pem: './path/to/pem'
      password: '#Ia2nddbb!'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    // TODO: change app name and path
    name: 'ontariogradebook',
    path: '../Gradebook/',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'https://ontariogradebook.com',
      MONGO_URL: 'mongodb://brendon:Masterbrendon1@ontariogradebook-shard-00-00-vujha.mongodb.net:27017,ontariogradebook-shard-00-01-vujha.mongodb.net:27017,ontariogradebook-shard-00-02-vujha.mongodb.net:27017/testdb?ssl=true&replicaSet=ontariogradebook-shard-0&authSource=admin',
      MONGO_OPLOG_URL: 'mongodb://brendon:Masterbrendon1@ontariogradebook-shard-00-00-vujha.mongodb.net:27017,ontariogradebook-shard-00-01-vujha.mongodb.net:27017,ontariogradebook-shard-00-02-vujha.mongodb.net:27017/local?ssl=true&replicaSet=ontariogradebook-shard-0&authSource=admin',
    },

    docker: {
      // change to 'abernix/meteord:base' if your app is using Meteor 1.4 - 1.5
      image: 'abernix/meteord:node-8.4.0-base', //we are using 1.6.1
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  // mongo: {
  //   version: '3.4.1',
  //   servers: {
  //     one: {}
  //   }
  // },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  proxy: { //IMPORTANT!!! MAKE SURE TO OPEN PORTS 80, 22, AND 443 ON THE SERVER
    domains: 'ontariogradebook.com,www.ontariogradebook.com,ontariogradebook.ca,www.ontariogradebook.ca',

    ssl: {
      // Enable Let's Encrypt
      letsEncryptEmail: 'ontariogradebook@gmail.com',
      forceSSL: true
    }
  }
};
