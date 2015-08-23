@libraries=../Task-steps
Feature: Test task: Add test task to run tests and save output reports
  As a developer
  I can run my BDD style tests in my IDE and get test results and coverage reports
  So that I can efficiently develop using the BDD style

  Scenario: Run tests with coverage

    Given TESTTASK is empty
    And the test package is loaded into the directory
    When executing test_cover
    Then the expected test report documentation is produced
    