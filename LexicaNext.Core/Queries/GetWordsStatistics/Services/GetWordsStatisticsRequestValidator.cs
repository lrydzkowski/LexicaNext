using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetWordsStatistics.Services;

public interface IGetWordsStatisticsRequestValidator
{
    Task<ValidationResult> ValidateAsync(GetWordsStatisticsRequest instance, CancellationToken cancellation);
}

public class GetWordsStatisticsRequestValidator
    : AbstractValidator<GetWordsStatisticsRequest>, IGetWordsStatisticsRequestValidator, ITransientService
{
    private static readonly IReadOnlyList<string> AllowedSortingFieldNames =
        ["correctCount", "incorrectCount", "word"];

    public GetWordsStatisticsRequestValidator()
    {
        AddValidationForPage();
        AddValidationForPageSize();
        AddValidationForSortingFieldName();
        AddValidationForSortingOrder();
        AddValidationForSearchQuery();
        AddValidationForTimeZoneId();
    }

    private void AddValidationForPage()
    {
        RuleFor(request => request.Page)
            .GreaterThanOrEqualTo(1)
            .WithName(nameof(GetWordsStatisticsRequest.Page));
    }

    private void AddValidationForPageSize()
    {
        RuleFor(request => request.PageSize)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(200)
            .WithName(nameof(GetWordsStatisticsRequest.PageSize));
    }

    private void AddValidationForSortingFieldName()
    {
        RuleFor(request => request.SortingFieldName)
            .Must(value => value != null && AllowedSortingFieldNames.Contains(value))
            .WithName(nameof(GetWordsStatisticsRequest.SortingFieldName))
            .WithMessage($"'{{PropertyName}}' must be one of: {string.Join(", ", AllowedSortingFieldNames)}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForSortingOrder()
    {
        RuleFor(request => request.SortingOrder)
            .Must(SortingOrderConstants.IsCorrect)
            .WithName(nameof(GetWordsStatisticsRequest.SortingOrder))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {SortingOrderConstants.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForSearchQuery()
    {
        RuleFor(request => request.SearchQuery)
            .MaximumLength(500)
            .When(request => request.SearchQuery is not null);
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
