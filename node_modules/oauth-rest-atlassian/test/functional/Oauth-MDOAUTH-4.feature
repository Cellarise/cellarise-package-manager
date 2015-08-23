Feature: OAuth: OAuth authorisation dance
  As a developer
  I can authorise my OAuth REST connection using a private key
  So that I do not need to store my password

  Scenario: JIRA authorisation

    Given I have an access token for my JIRA server
    When I perform the get issue operation on MDOAUTH-4
    Then issue MDOAUTH-4 is returned
