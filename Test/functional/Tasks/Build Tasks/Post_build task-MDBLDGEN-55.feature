@libraries=../Task-steps
Feature: Post_build task: Add post build verification test task
  As a build server
  I can run post build verification tests
  So that I can catch incomplete builds which failed to complete tests and packaging tasks

  @linked=MDBLDGEN-58,MDBLDGEN-69
  Scenario: Post verification of successfully executed package task

    Given POSTBUILD is empty
    And the test package is loaded into the directory
    And executed scaffold
    And executed metadata
    And executed package
    When executing post_build
    Then the post_build check passes

  Scenario: Post verification of unsuccessfully executed package task

    Given POSTBUILD is empty
    And the test package is loaded into the directory
    When executing post_build
    Then the post_build check fails
