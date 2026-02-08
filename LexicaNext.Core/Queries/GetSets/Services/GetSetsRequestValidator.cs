using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetSets.Services;

public class GetSetsRequestValidator : AbstractValidator<GetSetsRequest>
{
    public GetSetsRequestValidator()
    {
        AddValidationForPage();
        AddValidationForPageSize();
        AddValidationForSortingOrder();
        AddValidationForTimeZoneId();
    }

    private void AddValidationForPage()
    {
        RuleFor(request => request.Page).GreaterThanOrEqualTo(1).WithName(nameof(GetSetsRequest.Page));
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

    private void AddValidationForTimeZoneId()
    {
        RuleFor(request => request.TimeZoneId)
            .MaximumLength(100)
            .Must(id => TimeZoneInfo.TryFindSystemTimeZoneById(id!, out _))
            .WithMessage("'{PropertyName}' must be a valid IANA timezone identifier.")
            .When(request => request.TimeZoneId is not null);
    }
}
