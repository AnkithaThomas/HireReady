const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_3nk0jKMJ0",
      userPoolClientId: "4das6k77n038ce5vg96qvul4l1",
      region: "us-east-2",
    }
  },
  
  API: {
    REST: {
      jobRoadmapAPI: {
        endpoint: "https://hsztv5hu12.execute-api.us-east-2.amazonaws.com",
        region: "us-east-2",
      }
    }
  }
};

export default awsConfig;