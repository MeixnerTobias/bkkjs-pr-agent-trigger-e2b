import { logger, task } from "@trigger.dev/sdk/v3";
import { App } from "octokit";
import { PullRequestOpenedEvent } from "@octokit/webhooks-types";

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY

if (!appId || !privateKey) {
  throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set");
}

const app = new App({ appId, privateKey });


export const pullRequestOpened = task({
  id: "pull-request-opened",
  maxDuration: 300,
  run: async (payload: PullRequestOpenedEvent, { ctx }) => {
    logger.log("Pull request opened", { payload, ctx });

    const installationId = payload.installation?.id;
    if (!installationId) {
      throw new Error("No installation ID found in payload");
    }

    const pr = payload.pull_request;
    if (!pr) {
      throw new Error("No pull request data in payload");
    }

    const octokit = await app.getInstallationOctokit(installationId);

    // await runAgent(payload);

    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: pr.number,
      body: "LGTM!"
    });

    return {
      message: "Successfully processed pull request",
      prNumber: pr.number
    };
  },
});