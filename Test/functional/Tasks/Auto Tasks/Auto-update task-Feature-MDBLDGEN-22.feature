Feature: Auto-update task: Add a bulk task runner to update one or more projects
  As a developer
  The dependencies of all my packages are automatically updated and run through my build server
  So that I can keep my packages up to date with bug fixes and patches

  @linked=MDBLDGEN-65
  Scenario: Auto-update single project

    Given repository MDTEST
    When auto-updating with [updateCheckTask] [updateSourceTask] [updateSourceType] [bambooBuildTask] and [bambooPostBuildTask]
    Then the repository is automatically updated

    Examples:
    | updateCheckTask   | updateSourceTask  | updateSourceType  | bambooBuildTask  | bambooPostBuildTask  |
    | david_report_all  | all               | Non-functional    | test_cover       | null                 |
