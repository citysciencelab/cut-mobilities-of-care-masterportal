>Our git workflow.

[TOC]

# Git workflow

## Commit

* Commit early, commit often
* A commit represents an idea or a change
* Use verbs for your commits: **add**/**remove**/**update**/**refactor**/**fix**/**config**/**hotfix**
* Do not commit `console.log` statements

## Branches and workflow

* The development of new features and bug fixing usually takes place on features branches based on the `dev` branch. We use the **[Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows#gitflow-workflow)**.
* The development branch is named `dev`.
* Use verbs for merge commits: **add**/**remove**/**update**/**refactor**/**fix**/**config**/**hotfix**. Merge commit messages should be in English and speaking.
* Branches are deleted after merging.

## Pushing

* The commits are written to the repository with thematically closed pushes; however, the aim is not to include entire features in one push, but to model activities. Pushing your local development state on a daily basis is recommended to prevent data loss.

## Definition Of Done

* Before opening a pull request, the author checks whether these conditions are met:
    - The target branch has been merged to the feature branch immediately before opening the pull request. Hence, there are no merge conflicts.
    - The code is fine:
        - There are no warnings or errors in the linter report.
        - The code honors the **[conventions](codingConventions.md)**.
    - The documentation has been extended:
        - **[User documentation](doc.md)**
        - **[Developer documentation](devdoc.md)**
    - Test suites with tests are available:
        - For new functions: A short description of a test case to add it to the test protocol is provided. (Should result from the ticket.)
        - Unit tests are written: **[Test documentation](testing.md)**
    - A functional tests on a build portal was executed:
        - According to ticket description.
        - Cross-Browser (Chrome, IE 11, FF) - mobile behavior emulated in the browser.

## Forks

* **External developers** are not team members and do not receive write permission to the repository. Please **[fork](https://bitbucket.org/geowerkstatt-hamburg/masterportal/fork)** the `dev` branch for your development.
* Commit and push to your fork. From the fork, a pull request targeting the `dev` branch may be opened.
* Please also fix bugs targeting the `dev` branch:
    - Please indicate in the pull request if the bug should be published as a hotfix.. Please note our **[hints regarding versioning](versioning.md)**.
    - Team members take care of transferring the required code.
    - We use **[cherry-picking](https://git-scm.com/docs/git-cherry-pick)** to apply **hotfix** commits. This is simpler when **hotfix** commits contain the hotfix and nothing else. Please note our **[coding conventions](codingConventions.md)** regarding this.

## Pull Requests

* Commits pushed to branches may only reach the `dev` branch via pull requests.
* **External developers** set their PR's reviewer to **[geowerkstatt](https://bitbucket.org/geowerkstatt)**. This is a technical user that will note the team members.
* The review is done by at least one team member. The reviewer checks the pull request based on the Definition of Done. Errors or comments may be added directly to the code or as comments within the pull request.
* A pull request passing all checks is approved. The approving team member merges the commit for **external developers**.
