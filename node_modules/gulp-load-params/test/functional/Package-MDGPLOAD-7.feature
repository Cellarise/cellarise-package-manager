Feature: Package: Add option to provide an alternate lookup path for gulp tasks

  Scenario: load specified module with custom task path

    Given I have initialised gulp-load using a custom task path
    When I load a module with gulp tasks using a custom task path
    Then the gulp task in custom task path should exist