Feature: CoverageStat task: Calculate coverage summary statistics for visual badge
  As a developer
  I can generate coverage summary statistics in my package
  So that I can communicate overall coverage summary in readme files as a badge

  Scenario: Generate summary coverage statistics

    Given a test package with 100% coverage across all statistics
    When calculating the summary coverage statistics
    Then a brightgreen colour is returned for all statistics
