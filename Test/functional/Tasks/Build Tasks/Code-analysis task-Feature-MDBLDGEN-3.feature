@libraries=../Task-steps
Feature: Code-analysis task: Implement ESLint for custom static code analysis
  As a developer
  I can use ESLint for more sophisticated and custom static code analysis
  So that where possible to automate I can ensure code quality and enforce coding standards

  @linked=MDBLDGEN-58,MDBLDGEN-66
  Scenario: Run code analysis
    
    Given TESTCODE is empty
    And the test package is loaded into the directory
    When executing code_analysis
    Then the expected code analysis report documentation is produced
    