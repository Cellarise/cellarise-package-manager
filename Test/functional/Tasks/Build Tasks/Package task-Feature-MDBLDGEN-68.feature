@libraries=../Task-steps
Feature: Package task: Add task to create a build package using a buildignore file
  As a developer
  I can automatically generated my build package for deployment
  So that I can efficiently package only those files required for deployment

  @linked=MDBLDGEN-59,MDBLDGEN-60
    Scenario: Package build files for deployment
    
    Given TESTPACKAGE is empty
    And the test package is loaded into the directory
    When executing package
    Then the expected build package is produced
    