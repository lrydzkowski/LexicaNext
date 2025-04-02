using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetSets.Services;

internal class GetSetsRequestValidator : AbstractValidator<GetSetsRequest>
{
    public GetSetsRequestValidator()
    {
        AddValidationForPage();
        AddValidationForPageSize();
        AddValidationForSortingOrder();
    }

    private void AddValidationForPage()
    {
        RuleFor(request => request.Page).GreaterThan(1).WithName(nameof(GetSetsRequest.Page));
    }

    private void AddValidationForPageSize()
    {
        RuleFor(request => request.PageSize)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(200)
            .WithName(nameof(GetSetsRequest.PageSize));
    }

    private void AddValidationForSortingOrder()
    {
        RuleFor(request => request.SortingOrder)
            .Must(SortingOrderConstants.IsCorrect)
            .WithName(nameof(GetSetsRequest.SortingOrder))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {SortingOrderConstants.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }
}
