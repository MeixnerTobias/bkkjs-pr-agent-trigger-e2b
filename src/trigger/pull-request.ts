import { logger, task } from "@trigger.dev/sdk/v3";
import { App } from "octokit";
import { PullRequestOpenedEvent } from "@octokit/webhooks-types";
// import { ChatOpenAI } from '@langchain/openai'
// import { initializeAgentExecutorWithOptions } from 'langchain/agents'
// import { Sandbox } from '@e2b/sdk'


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

const runAgent = async (payload) => {
  // Reference from Maige - https://github.com/RubricLab/maige/blob/main/lib/agents/engineer.ts

  // Get diff of the PR

  // Init lang chain
  // const executor = await initializeAgentExecutorWithOptions(tools, model, {
  //   agentType: 'openai-functions',
  //   returnIntermediateSteps: isDev,
  //   handleParsingErrors: true,
  //   // verbose: true,
  //   agentArgs: {
  //     prefix
  //   }
  // })

  // init model
  // const model = new ChatOpenAI({
  //   modelName: 'gpt-4-turbo-preview',
  //   openAIApiKey: env.OPENAI_API_KEY,
  //   temperature: 0.3,
  //   callbacks: [
  //     {
  //       async handleLLMStart() {
  //         const result = await prisma.log.create({
  //           data: {
  //             runId: runId,
  //             action: 'Coming Soon',
  //             agent: 'engineer',
  //             model: 'gpt_4_turbo_preview'
  //           }
  //         })
  //         logId = result.id
  //       },
  //       async handleLLMError() {
  //       },
  //       async handleLLMEnd(data) {
  //       }
  //     }
  //   ]
  // })

  // const shell = await Sandbox.create({
  //   apiKey: process.env.E2B_API_KEY,
  // })

  // const installationToken = payload.installation.token;
  // const repoFullName = payload.repository.full_name;
  // const repo = payload.repository.name;
  // const branch = payload.pull_request.head.ref;
  // const repoSetup = `git config --global user.email "MyBot" && git config --global user.name "MyBot" && git clone https://x-access-token:${installationToken}@github.com/${repoFullName}.git && cd ${repo} && git checkout -b ${branch}`

  // shell.commands.run(repoSetup)

  // setup tools to complete tasks
}