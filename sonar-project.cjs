module.exports = {
  sonarqube: {
    serverUrl: "http://localhost:9000",
    token: "YOUR_TOKEN",
    options: {
      "sonar.projectKey": "my-project",
      "sonar.projectName": "my-project",
      "sonar.sources": "src",
      "sonar.exclusions": "**/*.test.tsx,**/*.spec.ts",
    },
  },
};