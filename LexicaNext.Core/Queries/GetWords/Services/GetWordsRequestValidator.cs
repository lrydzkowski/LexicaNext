using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetWords.Services;

public class GetWordsRequestValidator : AbstractValidator<GetWordsRequest>
{
    public GetWordsRequestValidator()
    {
        AddValidationForPage();
        AddValidationForPageSize();
        AddValidationForSortingOrder();
        AddValidationForTimezoneOffsetMinutes();
    }

    private void AddValidationForPage()
    {
        RuleFor(request => request.Page).GreaterThanOrEqualTo(1).WithName(nameof(GetWordsRequest.Page));
    }

    private void AddValidationForPageSize()
    {
        RuleFor(request => request.PageSize)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(200)
            .WithName(nameof(GetWordsRequest.PageSize));
    }

    private void AddValidationForSortingOrder()
    {
        RuleFor(request => request.SortingOrder)
            .Must(SortingOrderConstants.IsCorrect)
            .WithName(nameof(GetWordsRequest.SortingOrder))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {SortingOrderConstants.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForTimezoneOffsetMinutes()
    {
        RuleFor(request => request.TimezoneOffsetMinutes)
            .InclusiveBetween(-720, 840)
            .When(request => request.TimezoneOffsetMinutes.HasValue);
    }
}
