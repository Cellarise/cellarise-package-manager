@libraries=../Tasks/Task-steps
Feature: Script cgulp: Execute gulp using globally installed tasks and node_modules packages.

  Scenario: Automate creation of package.json where it doesn't already exist.
    
    Given CGULPBUILD is empty
    When executing cgulp null task
    Then no errors are returned
    