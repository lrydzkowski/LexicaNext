using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.UpdateWord.Interfaces;
using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Services;

public interface IUpdateWordRequestValidator
{
    Task<ValidationResult> ValidateAsync(UpdateWordRequest instance, CancellationToken cancellation);
}

public class UpdateWordRequestValidator
    : AbstractValidator<UpdateWordRequest>, IUpdateWordRequestValidator, ITransientService
{
    private readonly IUpdateWordRepository _updateWordRepository;
    private readonly IUserContextResolver _userContextResolver;

    public UpdateWordRequestValidator(
        IUpdateWordRepository updateWordRepository,
        IUserContextResolver userContextResolver
    )
    {
        _updateWordRepository = updateWordRepository;
        _userContextResolver = userContextResolver;

        AddPayloadValidation();
    }

    private void AddPayloadValidation()
    {
        RuleFor(request => request.WordId)
            .NotEmpty()
            .Must(id => Guid.TryParse(id, out _))
            .DependentRules(
                () => RuleFor(request => request.Payload!)
                    .NotNull()
                    .SetValidator(
                        request =>
                        {
                            string? userId = _userContextResolver.GetUserId();
                            return new UpdateWordRequestPayloadValidator(
                                userId,
                                Guid.Parse(request.WordId),
                                _updateWordRepository
                            );
                        }
                    )
            )
            .WithMessage("'{PropertyName}' must be a valid GUID.");
    }
}

internal class UpdateWordRequestPayloadValidator : AbstractValidator<UpdateWordRequestPayload>
{
    private readonly string? _userId;

    public UpdateWordRequestPayloadValidator(string? userId, Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        _userId = userId;
        AddValidationForWord(wordId, updateWordRepository);
        AddValidationForWordType();
        AddValidationForTranslations();
        AddValidationForExampleSentences();
    }

    private void AddValidationForWord(Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        RuleFor(request => request.Word)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(() => AddValidationForWordUniqueness(wordId, updateWordRepository))
            .WithName(nameof(UpdateWordCommand.Word));
    }

    private void AddValidationForWordUniqueness(Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        RuleFor(request => request)
            .MustAsync(
                async (request, cancellationToken) =>
                {
                    if (_userId is null)
                    {
                        return false;
                    }

                    bool exists = await updateWordRepository.WordExistsAsync(
                        _userId,
                        request.Word,
                        request.WordType,
                        wordId,
                        cancellationToken
                    );

                    return !exists;
                }
            )
            .WithMessage(request => $"The word '{request.Word}' with the type = '{request.WordType}' already exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(UpdateWordCommand.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForTranslations()
    {
        RuleFor(request => request.Translations)
            .NotEmpty()
            .DependentRules(() => RuleForEach(request => request.Translations).NotEmpty().MaximumLength(200));
    }

    private void AddValidationForExampleSentences()
    {
        RuleForEach(request => request.ExampleSentences).NotEmpty().MaximumLength(500);
    }
}
