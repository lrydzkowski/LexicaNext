using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class UserContextScope
{
    public Task<WebApplicationFactory<Program>> InitializeAsync(
        WebApplicationFactory<Program> factory,
        ITestCaseData testCase
    )
    {
        IUserContextResolver userContextResolver = Substitute.For<IUserContextResolver>();
        userContextResolver.GetUserId().Returns(testCase.UserId);

        factory = factory.ReplaceService(userContextResolver, ServiceLifetime.Scoped);

        return Task.FromResult(factory);
    }
}
