using System.Reflection;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db;

internal class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<WordTypeEntity> WordTypes => Set<WordTypeEntity>();

    public DbSet<WordEntity> Words => Set<WordEntity>();

    public DbSet<TranslationEntity> Translations => Set<TranslationEntity>();

    public DbSet<SetEntity> Sets => Set<SetEntity>();

    public DbSet<SetWordEntity> SetWords => Set<SetWordEntity>();

    public DbSet<RecordingEntity> Recordings => Set<RecordingEntity>();

    public DbSet<AnswerEntity> Answers => Set<AnswerEntity>();

    public DbSet<ExampleSentenceEntity> ExampleSentences => Set<ExampleSentenceEntity>();

    public DbSet<UserSetSequenceEntity> UserSetSequences => Set<UserSetSequenceEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
