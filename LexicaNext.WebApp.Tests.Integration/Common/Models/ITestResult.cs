using System.Net;

namespace LexicaNext.WebApp.Tests.Integration.Common.Models;

internal interface ITestResult
{
    int TestCaseId { get; }

    string? LogMessages { get; }
}

internal interface IHttpTestResult : ITestResult
{
    HttpStatusCode StatusCode { get; }

    string? Response { get; }
}
