@libraries=../Task-steps
Feature: Docs-changelog task: Add a gulp task to generate a change log from JIRA fix versions.
  As a developer
  I can automatically synchronise the change log for my project from JIRA with my repository
  So that I can efficiently maintain and provide viewers of my repository an upto date change log

  Scenario: Change log

    Given TESTDOCSPRE is empty
    And the test package is loaded into the directory
    When executing docs_changelog
    Then expected documentation is produced
    