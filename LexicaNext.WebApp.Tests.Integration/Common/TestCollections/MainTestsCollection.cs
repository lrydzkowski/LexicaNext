using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;

namespace LexicaNext.WebApp.Tests.Integration.Common.TestCollections;

[CollectionDefinition(CollectionName)]
public class MainTestsCollection : ICollectionFixture<WebApiFactory>
{
    public const string CollectionName = "Integration.Main";
}
