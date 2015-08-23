Feature: Package: Develop asynchronous function runner.
  As a developer
  I can execute asynchronous functions as a gulp task
  So that I can efficiently integrate asynchronous functions into streams

  Scenario: Simple asynchronous function execution

    Given a simple asynchronous function
    When executing the function as part of a gulp pipe
    Then the pipe will wait for function to complete before continuing