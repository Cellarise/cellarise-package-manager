@libraries=../other-steps.js
Feature: Generate test steps from gherkin features
  As a developer
  I want to be able to generate test step boilerplate code from gherkin features
  So that I can focus effort on building quality test steps

  Scenario: Generating test steps

    Given I have a missing-step feature file
    And the test steps file doesn't already exist
    And the test step library missing-step
    When I parse the feature file with the missing option set
    Then missing steps snippets are streamed


  Scenario: 2nd generation test steps

    Given I have another missing-step feature file
    When I parse the feature file with the missing option set
    Then missing steps snippets are streamed
