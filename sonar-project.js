module.exports = {
  sonarqube: {
    serverUrl: "http://localhost:9000",
    token: "squ_2b651f6c734ebbe21b4e4835cf001388826c40fd",
    options: {
      "sonar.projectKey": "notifier",
      "sonar.projectName": "notifier",
      "sonar.sources": "src",
      "sonar.exclusions": "**/*.test.tsx,**/*.spec.ts",
      "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
      "sonar.organization": "notifier",
      "sonar.exclusions": "node_modules/**,dist/**,coverage/**"
    },
  },
};