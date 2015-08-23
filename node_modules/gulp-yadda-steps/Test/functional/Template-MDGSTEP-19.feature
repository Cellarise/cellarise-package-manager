@libraries=Package-MDGSTEP-2-steps
Feature: Template: Update step library template to match new eslint rules
  As a developer
  I can automatically add missing steps to my step library based on my test feature
  So that I can make frequent changes to my test feature and keep my step library up to date with minimal time and effort

  Scenario: Add missing steps

    Given I have a simple feature file
    And the test steps file doesn't already exist
    When I parse the feature file
    Then a yadda json output is generated
    