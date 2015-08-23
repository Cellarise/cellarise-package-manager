@libraries=../Task-steps
Feature: Dependency task: Add David dependency check task
  As a developer
  I can automatically check the status of my dependencies as part of my build process
  So that I can efficiently check dependency status and ensure the currency of my dependencies

  @linked=MDBLDGEN-58
  Scenario: Check test package dependencies pass

    Given the Cellarise/cellarise-package-manager package manifest
    When executing david_report
    Then the david report passes

  Scenario: Check test package dependencies fails

    Given a package manifest with out of date dependencies
    When executing david_report_all
    Then the david report fails
