using LexicaNext.Core.Commands.RegisterAnswer.Interface;
using LexicaNext.Core.Commands.RegisterAnswer.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class AnswerRepository : IScopedService, IRegisterAnswerRepository
{
    private readonly IDateTimeOffsetProvider _dateTimeOffsetProvider;
    private readonly AppDbContext _dbContext;

    public AnswerRepository(AppDbContext dbContext, IDateTimeOffsetProvider dateTimeOffsetProvider)
    {
        _dbContext = dbContext;
        _dateTimeOffsetProvider = dateTimeOffsetProvider;
    }

    public async Task<bool> WordExistsAsync(
        string userId,
        Guid wordId,
        CancellationToken cancellationToken = default
    )
    {
        return await _dbContext.Words.AsNoTracking()
            .AnyAsync(entity => entity.WordId == wordId && entity.UserId == userId, cancellationToken);
    }

    public async Task RegisterAnswerAsync(RegisterAnswerCommand registerAnswerCommand)
    {
        AnswerEntity answerEntity = new()
        {
            AnswerId = Guid.CreateVersion7(),
            UserId = registerAnswerCommand.UserId,
            ModeType = registerAnswerCommand.ModeType,
            QuestionType = registerAnswerCommand.QuestionType,
            Question = registerAnswerCommand.Question,
            GivenAnswer = registerAnswerCommand.GivenAnswer,
            ExpectedAnswer = registerAnswerCommand.ExpectedAnswer,
            IsCorrect = registerAnswerCommand.IsCorrect,
            AnsweredAt = _dateTimeOffsetProvider.UtcNow,
            WordId = registerAnswerCommand.WordId
        };
        _dbContext.Answers.Add(answerEntity);
        await _dbContext.SaveChangesAsync();
    }
}
