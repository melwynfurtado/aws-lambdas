import { Octokit } from "@octokit/core";
import { getYesterdayDate } from "./utils.mjs";

const defaultOptions = {
  owner: "melwynfurtado",
  repo: "postcode-validator",
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

export const getRepoWorkflows = async () => {
  return await octokit.request(
    "GET /repos/{owner}/{repo}/actions/workflows",
    defaultOptions
  );
};

export const getRepoWorkflowRuns = async () => {
  return await octokit.request(
    `GET /repos/{owner}/{repo}/actions/runs?created=>=${getYesterdayDate()}`,
    defaultOptions
  );
};

export const getWorkflowUsage = async (workflow_id) => {
  return await octokit.request(
    "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing",
    {
      ...defaultOptions,
      workflow_id,
    }
  );
};

export const getWorkflowRuns = async (workflow_id) => {
  return await octokit.request(
    `GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs?created=>=${getYesterdayDate()}`,
    {
      ...defaultOptions,
      workflow_id,
    }
  );
};

export const getWorkflowRunUsage = async (run_id) => {
  return await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing",
    {
      ...defaultOptions,
      run_id,
    }
  );
};
