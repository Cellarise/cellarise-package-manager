@libraries=Oauth-MDOAUTH-4-steps
Feature: Package: Add Atlassian JIRA rest query function
  As a developer
  I can execute a JIRA rest query using oauth config
  So that I can efficiently read data or write data to my JIRA server

  Scenario: JIRA GET rest query

    Given I have an access token for my JIRA server
    When I perform a jql search on issue MDOAUTH-7 and save the result
    Then expected search results are returned