Feature: Package: Generate test steps from gherkin features.
  As a developer
  I want to be able to generate test step boilerplate code from gherkin features
  So that I can focus effort on building quality test steps

  Scenario: Generating yadda json outputs for simple features

    Given I have a simple feature file
    And the test steps file doesn't already exist
    When I parse the feature file
    Then a yadda json output is generated

  Scenario: Generating yadda json outputs for complex features

    Given I have a complex feature file
    And the test steps file doesn't already exist
    When I parse the feature file
    Then a yadda json output is generated

  Scenario: Generating test step library for simple json output

    Given I have a simple json output
    When I render the json output
    Then a test steps script is generated

  Scenario: Generating test step library for complex json output

    Given I have a complex json output
    When I render the json output
    Then a test steps script is generated


  @linked=MDGSTEP-4,MDGSTEP-5,MDGSTEP-9,MDGSTEP-14
  Scenario: Render: Fix duplicate steps generated in output.

    Given I have a report feature file
    When I parse and render the feature file
    Then a test steps script is generated