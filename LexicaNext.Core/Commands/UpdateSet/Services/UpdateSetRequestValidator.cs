using FluentValidation;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

public class UpdateSetRequestValidator : AbstractValidator<UpdateSetRequest>
{
    private readonly IGetWordRepository _getWordRepository;
    private readonly IUpdateSetRepository _updateSetRepository;
    private readonly IUserContextResolver _userContextResolver;

    public UpdateSetRequestValidator(
        IUpdateSetRepository updateSetRepository,
        IGetWordRepository getWordRepository,
        IUserContextResolver userContextResolver
    )
    {
        _updateSetRepository = updateSetRepository;
        _getWordRepository = getWordRepository;
        _userContextResolver = userContextResolver;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(
                x =>
                {
                    Guid.TryParse(x.SetId, out Guid parsedSetId);
                    string userId = _userContextResolver.GetUserId();

                    return new UpdateSetRequestPayloadValidator(
                        userId,
                        parsedSetId,
                        _updateSetRepository,
                        _getWordRepository
                    );
                }
            );
    }
}

internal class UpdateSetRequestPayloadValidator : AbstractValidator<UpdateSetRequestPayload>
{
    private readonly IGetWordRepository _getWordRepository;
    private readonly Guid _setId;
    private readonly IUpdateSetRepository _updateSetRepository;
    private readonly string _userId;

    public UpdateSetRequestPayloadValidator(
        string userId,
        Guid setId,
        IUpdateSetRepository updateSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _setId = setId;
        _updateSetRepository = updateSetRepository;
        _getWordRepository = getWordRepository;
        _userId = userId;

        AddValidationForWordIds();
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
                        _userId,
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
