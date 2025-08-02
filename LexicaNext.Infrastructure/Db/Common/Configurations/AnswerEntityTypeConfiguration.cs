using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class AnswerEntityTypeConfiguration : IEntityTypeConfiguration<AnswerEntity>
{
    public void Configure(EntityTypeBuilder<AnswerEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureColumns(builder);
    }

    private void SetTableName(EntityTypeBuilder<AnswerEntity> builder)
    {
        builder.ToTable(AnswerEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<AnswerEntity> builder)
    {
        builder.HasKey(entity => entity.AnswerId);
    }

    private void ConfigureColumns(EntityTypeBuilder<AnswerEntity> builder)
    {
        builder.Property(entity => entity.AnswerId)
            .HasColumnName("answer_id")
            .IsRequired();

        builder.Property(entity => entity.Question)
            .HasColumnName("question")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(entity => entity.GivenAnswer)
            .HasColumnName("given_answer")
            .HasMaxLength(500);

        builder.Property(entity => entity.ExpectedAnswer)
            .HasColumnName("expected_answer")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(entity => entity.AnsweredAt)
            .HasColumnName("answered_at")
            .IsRequired();
    }
}
