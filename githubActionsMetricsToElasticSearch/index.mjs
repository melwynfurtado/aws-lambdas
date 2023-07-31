import {
  getRepoWorkflowRuns,
  getRepoWorkflows,
  getWorkflowUsage,
  getWorkflowRunUsage,
} from "./github.api.mjs";

export const handler = async (_event) => {
  try {
    // Get all workflows for a repo
    const repoWorkflows = await getRepoWorkflows();

    // Get total usage(billable time) for all repo workflows
    const workflowsUsage = await Promise.allSettled(
      repoWorkflows.data.workflows.map((workflow) =>
        getWorkflowUsage(workflow.id)
      )
    );

    // Get all workflow runs since yesterday
    const repoWorkflowRuns = await getRepoWorkflowRuns();

    // Get usage(billable time) for workflow runs
    const workflowRunsUsage = await Promise.allSettled(
      repoWorkflowRuns.data.workflow_runs.map((run) =>
        getWorkflowRunUsage(run.id)
      )
    );

    // Merge workflow, workflow runs and usage
    const workflowRunsWithUsage = repoWorkflows.data.workflows.map(
      (workflow, index) => {
        return {
          id: workflow.id,
          name: workflow.name,
          state: workflow.state,
          ...(workflowsUsage[index].status === "fulfilled"
            ? workflowsUsage[index].value.data
            : null),
          workflow_runs: repoWorkflowRuns.data.workflow_runs
            .map((run, index) => {
              if (run.workflow_id !== workflow.id) return null;
              return {
                id: run.id,
                workflow_id: run.workflow_id,
                status: run.status,
                ...(workflowRunsUsage[index].status === "fulfilled"
                  ? workflowRunsUsage[index].value.data
                  : null),
              };
            })
            .filter(Boolean),
        };
      }
    );
    console.log(
      "workflowRunsWithUsage: ",
      JSON.stringify(workflowRunsWithUsage)
    );

    //TODO:: Send metrics to Elastic Search
    //sendMetricsToElasticSearch();
  } catch (e) {
    console.log("Error: ", e);
  }
// };
