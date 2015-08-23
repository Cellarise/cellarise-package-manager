Feature: Develop a gulp task loader with parameters
  As a developer
  I can load gulp tasks automatically and pass them parameters
  So that I can simplify my build scaffold and process

  Scenario: gulp-load

    Given I have initialised gulp-load
    When I call gulp loadTasks
    Then it should be equal to the function returned from gulp-load

  Scenario: load single file

    Given I have initialised gulp-load
    When I load a file with a gulp task
    Then the gulp task in file should exist

  Scenario: load specified module

    Given I have initialised gulp-load
    When I load a module with gulp tasks
    Then the gulp task in module should exist

  Scenario: load specified module with custom module prefix

    Given I have initialised gulp-load using a custom module prefix
    When I load a module with gulp tasks using a custom module prefix
    Then the gulp task in custom prefixed module should exist

  Scenario: gulp-load-global

    Given I have initialised gulp-load
    When I load a global module with gulp tasks
    Then the gulp task in global module should not exist

  Scenario: ignore when not exist

    Given I have initialised gulp-load
    When I load a module with dependencies which do not exist
    Then the no error should be thrown

  Scenario: pass parameter

    Given I have initialised gulp-load
    When I load a file with a gulp task and pass parameters
    Then the gulp task in file should exist and read the parameters