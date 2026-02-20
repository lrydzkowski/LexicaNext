using LexicaNext.WebApp.Tests.Integration.Common.Models;
using NSubstitute.Core;

namespace LexicaNext.WebApp.Tests.Integration.Common.Extensions;

internal static class NSubstituteExtensions
{
    public static List<ReceivedMethodCall> GetReceivedMethodCalls<T>(this T substitute) where T : class
    {
        return SubstitutionContext.Current.GetCallRouterFor(substitute)!
            .ReceivedCalls()
            .Select(
                call => new ReceivedMethodCall
                {
                    MethodName = call.GetMethodInfo().Name,
                    Arguments = call.GetArguments()
                }
            )
            .ToList();
    }
}
