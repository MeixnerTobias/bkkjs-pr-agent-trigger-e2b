import { Elysia } from "elysia";
import { tasks } from "@trigger.dev/sdk/v3";
import { PullRequestOpenedEvent, PullRequestReopenedEvent } from "@octokit/webhooks-types";

const app = new Elysia()
    .post("/webhook/github", async ({ body, set }: {
        body: PullRequestOpenedEvent | PullRequestReopenedEvent,
        set: any
    }) => {
        try {
            switch (body.action) {
                case 'reopened':
                case 'opened':
                    const { id } = await tasks.trigger(
                        "pull-request-opened",
                        body
                    );
                    set.status = 200;
                    return { success: true, runId: id };

                default:
                    set.status = 200;
                    return { success: true };
            }

        } catch (error) {
            console.error("Error processing webhook:", error);
            set.status = 500;
            return { error: "Failed to process webhook" };
        }
    })
    .listen(4338);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`); 