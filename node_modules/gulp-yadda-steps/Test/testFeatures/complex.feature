Feature: Generate test steps from gherkin features
  As a developer
  I want to be able to generate test step boilerplate code from gherkin features
  So that I can focus effort on building quality test steps

  Scenario: Generating test steps

    Given I have a complex feature file
    And the test steps file doesn't already exist
    When I read the feature file
    Then a test steps file is generated
