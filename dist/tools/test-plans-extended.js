// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Extended by GreenJeans/azure-devops-mcp-extended
import { z } from "zod";
const Extended_Test_Plan_Tools = {
    list_test_suites: "testplan_list_test_suites",
    get_test_points: "testplan_get_test_points",
    list_test_runs: "testplan_list_test_runs",
};
function configureExtendedTestPlanTools(server, connectionProvider) {
    /*
      LIST TEST SUITES
      get all test suites for a plan
    */
    server.tool(Extended_Test_Plan_Tools.list_test_suites, "Retrieve all test suites for a given test plan, optionally as a tree view. Returns suite hierarchy including suite type (static, requirement-based, query-based), parent relationships, and child counts.", {
        project: z.string().describe("The unique identifier (ID or name) of the Azure DevOps project."),
        planId: z.number().describe("The ID of the test plan."),
        asTreeView: z.boolean().default(false).describe("If true, returns suites in a tree structure showing parent-child relationships."),
        continuationToken: z.string().optional().describe("Token to continue fetching suites from a previous request."),
    }, async ({ project, planId, asTreeView, continuationToken }) => {
        const connection = await connectionProvider();
        const testPlanApi = await connection.getTestPlanApi();
        const suites = await testPlanApi.getTestSuitesForPlan(project, planId, undefined, continuationToken, asTreeView);
        return {
            content: [{ type: "text", text: JSON.stringify(suites, null, 2) }],
        };
    });
    /*
      GET TEST POINTS
      get test points for a suite, which include execution outcome
    */
    server.tool(Extended_Test_Plan_Tools.get_test_points, "Retrieve test points for a test suite. Test points represent the assignment of a test case to a configuration and tester, and include the latest execution outcome (passed, failed, blocked, not applicable, paused, in progress, none).", {
        project: z.string().describe("The unique identifier (ID or name) of the Azure DevOps project."),
        planId: z.number().describe("The ID of the test plan."),
        suiteId: z.number().describe("The ID of the test suite."),
        testCaseId: z.string().optional().describe("Filter test points by a specific test case ID."),
        includePointDetails: z.boolean().default(true).describe("Include detailed information about each test point including results."),
        isRecursive: z.boolean().default(false).describe("If true, includes test points from child suites."),
        continuationToken: z.string().optional().describe("Token to continue fetching test points from a previous request."),
    }, async ({ project, planId, suiteId, testCaseId, includePointDetails, isRecursive, continuationToken }) => {
        const connection = await connectionProvider();
        const testPlanApi = await connection.getTestPlanApi();
        const points = await testPlanApi.getPointsList(project, planId, suiteId, undefined, testCaseId, continuationToken, undefined, includePointDetails, isRecursive);
        return {
            content: [{ type: "text", text: JSON.stringify(points, null, 2) }],
        };
    });
    /*
      LIST TEST RUNS
      get test runs for a project, optionally filtered by plan
    */
    server.tool(Extended_Test_Plan_Tools.list_test_runs, "Retrieve test runs for a project. Test runs are created when tests are executed via the Test Runner or automated pipelines. Returns run details including state, total/passed/failed counts, and associated plan/build information.", {
        project: z.string().describe("The unique identifier (ID or name) of the Azure DevOps project."),
        planId: z.number().optional().describe("Filter test runs by a specific test plan ID."),
        includeRunDetails: z.boolean().default(true).describe("Include detailed run information."),
        automated: z.boolean().optional().describe("Filter by automated (true) or manual (false) runs. Omit for all."),
        top: z.number().default(25).describe("Maximum number of runs to return."),
        skip: z.number().default(0).describe("Number of runs to skip."),
    }, async ({ project, planId, includeRunDetails, automated, top, skip }) => {
        const connection = await connectionProvider();
        const testApi = await connection.getTestApi();
        const runs = await testApi.getTestRuns(project, undefined, undefined, undefined, planId, includeRunDetails, automated, skip, top);
        return {
            content: [{ type: "text", text: JSON.stringify(runs, null, 2) }],
        };
    });
}
export { configureExtendedTestPlanTools };
