Feature: Rest: Add Atlassian Bamboo support
  As a developer
  I can execute a Bamboo rest query using oauth config
  So that I can efficiently read data or write data to my Bamboo server

  Scenario: Bamboo GET rest query

    Given I have an access token for my Bamboo server
    When I perform a build plan get
    Then build plans are returned
