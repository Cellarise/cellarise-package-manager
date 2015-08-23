@libraries=../Task-steps
Feature: Step-sync task: Change sync of JIRA issues to linked Feature issue test feature
  As a developer
  I can automatically synchronise JIRA issues (Feature issue type) to linked Feature issue test feature (ignoring Deprecated issues)
  So that I can efficiently maintain my test features

  Scenario: Add missing steps

    Given TESTSTEPSYNC is empty
    And the test package is loaded into the directory
    And the existing Test step features are cleared
    When executing step_sync
    Then the expected step features are produced
