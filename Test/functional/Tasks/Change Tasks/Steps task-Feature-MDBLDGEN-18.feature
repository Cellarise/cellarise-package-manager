@libraries=../Task-steps.js
Feature: Steps task: Automate synchronisation of BDD test scripts from JIRA.
  As a developer
  I can automatically update JIRA from my test feature script or download from JIRA my test feature script
  So that I can create test features quickly and make frequent changes to my test feature and keep JIRA up to date with minimal time and effort

  Scenario: Create step libraries

    Given TESTSTEPS is empty
    And the test package is loaded into the directory
    And the existing Test step libraries are cleared
    When executing steps
    Then the expected step libraries are produced
    