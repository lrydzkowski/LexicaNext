using FluentValidation;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;

namespace LexicaNext.Core.Commands.CreateSet.Services;

public class CreateSetRequestValidator : AbstractValidator<CreateSetRequest>
{
    private readonly ICreateSetRepository _createSetRepository;
    private readonly IGetWordRepository _getWordRepository;

    public CreateSetRequestValidator(
        ICreateSetRepository createSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _createSetRepository = createSetRepository;
        _getWordRepository = getWordRepository;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new CreateSetRequestPayloadValidator(_createSetRepository, _getWordRepository));
    }
}

internal class CreateSetRequestPayloadValidator : AbstractValidator<CreateSetRequestPayload>
{
    private readonly ICreateSetRepository _createSetRepository;
    private readonly IGetWordRepository _getWordRepository;

    public CreateSetRequestPayloadValidator(
        ICreateSetRepository createSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _createSetRepository = createSetRepository;
        _getWordRepository = getWordRepository;

        AddValidationForSetName();
        AddValidationForWordIds();
    }

    private void AddValidationForSetName()
    {
        RuleFor(request => request.SetName)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(AddValidationForSetNameUniqueness)
            .WithName(nameof(CreateSetCommand.SetName));
    }

    private void AddValidationForSetNameUniqueness()
    {
        RuleFor(request => request.SetName)
            .MustAsync(
                async (setName, cancellationToken) =>
                {
                    bool setWithNameExists =
                        await _createSetRepository.SetExistsAsync(setName, null, cancellationToken);

                    return !setWithNameExists;
                }
            )
            .WithName(nameof(CreateSetCommand.SetName))
            .WithMessage("'{PropertyName}' with the given name ('{PropertyValue}') exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForWordIds()
    {
        RuleFor(request => request.WordIds)
            .NotEmpty()
            .Must(
                wordIds =>
                {
                    List<string> distinctWordIds = wordIds.Distinct().ToList();

                    return distinctWordIds.Count == wordIds.Count;
                }
            )
            .WithMessage("'{PropertyName}' cannot contain duplicate word IDs.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);

        RuleForEach(request => request.WordIds)
            .Must(wordId => Guid.TryParse(wordId, out _))
            .WithMessage("'{PropertyValue}' is not a valid word ID format.");

        RuleFor(request => request.WordIds)
            .MustAsync(
                async (wordIds, cancellationToken) =>
                {
                    List<Guid> parsedIds = wordIds
                        .Where(id => Guid.TryParse(id, out _))
                        .Select(Guid.Parse)
                        .ToList();

                    if (parsedIds.Count != wordIds.Count)
                    {
                        return true;
                    }

                    List<Guid> existingIds = await _getWordRepository.GetExistingWordIdsAsync(
                        parsedIds,
                        cancellationToken
                    );

                    return existingIds.Count == parsedIds.Count;
                }
            )
            .WithMessage("One or more word IDs do not exist.")
            .WithErrorCode(ValidationErrorCodes.ExistenceValidator);
    }
}
