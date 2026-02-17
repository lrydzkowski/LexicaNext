using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class UserContextScope
{
    public UserContextScope(WebApplicationFactory<Program> factory)
    {
        Factory = factory;
    }

    public WebApplicationFactory<Program> Factory { get; private set; }

    public Task InitializeAsync(ITestCaseData testCase)
    {
        IUserContextResolver userContextResolver = Substitute.For<IUserContextResolver>();
        userContextResolver.GetUserId().Returns(testCase.UserId);

        Factory = Factory.ReplaceService(userContextResolver, ServiceLifetime.Scoped);

        return Task.CompletedTask;
    }
}
