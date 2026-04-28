const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_rGOpcYKx8",
      userPoolClientId: "3jn9e185ariamea0a11b9rcei",
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