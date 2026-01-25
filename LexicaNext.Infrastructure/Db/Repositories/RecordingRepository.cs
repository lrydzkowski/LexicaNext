using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRecording.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class RecordingRepository : IScopedService, IRecordingMetaData
{
    private readonly AppDbContext _dbContext;
    private readonly IWordTypesRepository _wordTypesRepository;

    public RecordingRepository(AppDbContext dbContext, IWordTypesRepository wordTypesRepository)
    {
        _dbContext = dbContext;
        _wordTypesRepository = wordTypesRepository;
    }

    public async Task<string?> GetFileNameAsync(
        string word,
        WordType wordType,
        CancellationToken cancellationToken = default
    )
    {
        string? fileName = await _dbContext.Recordings.AsNoTracking()
            .Where(
                recordingEntity => recordingEntity.Word == word
                                   && recordingEntity.WordType != null
                                   && recordingEntity.WordType.Name == wordType.ToString()
            )
            .Select(recordingEntity => recordingEntity.FileName)
            .FirstOrDefaultAsync(cancellationToken);

        return fileName;
    }

    public async Task AddFileNameAsync(
        string word,
        WordType wordType,
        string fileName,
        CancellationToken cancellationToken = default
    )
    {
        bool isNew = false;
        RecordingEntity? recordingEntity =
            await _dbContext.Recordings.FirstOrDefaultAsync(x => x.Word == word, cancellationToken);
        if (recordingEntity is null)
        {
            isNew = true;
            recordingEntity = new RecordingEntity();
            recordingEntity.RecordingId = Guid.CreateVersion7();
        }

        recordingEntity.Word = word;
        recordingEntity.WordTypeId = await GetWordTypeIdAsync(wordType, cancellationToken);
        recordingEntity.FileName = fileName;
        if (isNew)
        {
            await _dbContext.Recordings.AddAsync(recordingEntity, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Guid> GetWordTypeIdAsync(WordType wordType, CancellationToken cancellationToken = default)
    {
        Guid? wordTypeId = await _wordTypesRepository.GetWordTypeIdAsync(wordType, cancellationToken);
        if (wordTypeId is null)
        {
            throw new InvalidOperationException($"Word type '{wordType}' doesn't exist in database.");
        }

        return (Guid)wordTypeId;
    }
}
