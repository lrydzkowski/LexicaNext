namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal interface ITestCaseData
{
    int TestCaseId { get; }

    string UserId { get; }

    BaseTestCaseData Data { get; }
}
