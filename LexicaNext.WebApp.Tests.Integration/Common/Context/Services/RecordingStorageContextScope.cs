using LexicaNext.Core.Queries.GetRecording.Interfaces;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class RecordingStorageContextScope
{
    public IRecordingStorage Mock { get; private set; } = null!;

    public Task<WebApplicationFactory<Program>> InitializeAsync(
        WebApplicationFactory<Program> factory,
        ITestCaseData testCase
    )
    {
        Mock = Substitute.For<IRecordingStorage>();

        foreach ((string fileName, byte[]? bytes) in testCase.Data.RecordingStorage.Files)
        {
            Mock.GetFileAsync(fileName, Arg.Any<CancellationToken>()).Returns(bytes);
        }

        factory = factory.ReplaceService(Mock, ServiceLifetime.Scoped);

        return Task.FromResult(factory);
    }
}
