@libraries=../Task-steps
Feature: Docs task: Generate Readme file from doc templates
  As a developer
  I can generate a readme file which includes manually entered usage instructions and automatically generated license, JSDoc API, changelog, and contains npm version, dependency status, test-coverage stats, and Github issue badges
  So that I can efficiently produce a readme that contains all the information required by users

  @linked=MDBLDGEN-53
  Scenario: Generate Readme file from doc templates

    Given TESTDOCS is empty
    And the test package is loaded into the directory
    When executing docs
    Then docs expected documentation is produced
    