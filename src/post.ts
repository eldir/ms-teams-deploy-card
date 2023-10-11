import {getInput, info, setFailed} from "@actions/core";
import {formatAndNotify, getWorkflowRunStatus} from "./utils";

try {
  // setTimeout to give time for GitHub API to show up the final conclusion
  setTimeout(async () => {
    const showCardOnExit = getInput("show-on-exit").toLowerCase() === "true";
    const showCardOnFailure = getInput("show-on-failure").toLowerCase() === "true";
    const ignoreCancel = getInput("ignore-cancel").toLowerCase() === "true";

    const workflowRunStatus = await getWorkflowRunStatus();
    info("Run conclusion: " + workflowRunStatus.conclusion);

    if (workflowRunStatus.conclusion === "cancelled" && ignoreCancel) {
      info("Configured to not show card upon job cancel.")
    } else if (
      (showCardOnExit && !showCardOnFailure) ||
      (showCardOnFailure
        && workflowRunStatus.conclusion !== undefined
        && workflowRunStatus.conclusion !== "success"
        && workflowRunStatus.conclusion !== "in_progress")
    ) {
      await formatAndNotify(
        "exit",
        workflowRunStatus.conclusion ?? undefined,
        workflowRunStatus.elapsedSeconds
      );
    } else {
      info("Configured to not show card upon job exit.");
    }
  }, 2000);
} catch (error) {
  info("Error:")
  if (error instanceof Error) {
    info(error.message);
  } else {
    info(<string>error);
  }
}
