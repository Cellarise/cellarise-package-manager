Feature: Develop clover-style json report with source-map support
  As a developer
  I can run Istanbul code coverage on script bundles and have code coverage reported against the original source code
  So that I can use script bundles and code coverage that reports against my original source for more efficient and accurate code coverage reporting

  Scenario: Code coverage report with no source maps

    Given I have a non-bundled Javascript file
    When I run the coverage report on the files
    Then a report is produced referencing the non-bundled files

  Scenario: Code coverage report with source maps

    Given I have a bundled Javascript file
    When I execute the coverage report on the file
    Then a report is produced referencing the non-bundled files
