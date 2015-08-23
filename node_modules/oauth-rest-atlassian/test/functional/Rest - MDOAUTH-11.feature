@libraries=Oauth-MDOAUTH-4-steps
Feature: Rest: Add post, put and delete methods to rest function
  As a developer
  I can execute a JIRA rest query using the post, put and delete methods
  So that I can efficiently create, update or delete data on my JIRA server

  Scenario: JIRA POST rest query

    Given I have an access token for my JIRA server
    When I perform a post create operation
    Then a new issue is created

  Scenario: JIRA PUT rest query

    Given I have an access token for my JIRA server
    When I perform a put update operation
    Then expected update is performed

  @bug=MDOAUTH-14
  Scenario: JIRA transition rest query

    Given I have an access token for my JIRA server
    When I perform a transition operation
    Then expected transition is performed

  Scenario: JIRA DELETE rest query

    Given I have an access token for my JIRA server
    When I perform a delete operation
    Then expected delete is performed
