using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class UserSetSequenceEntityTypeConfiguration : IEntityTypeConfiguration<UserSetSequenceEntity>
{
    public void Configure(EntityTypeBuilder<UserSetSequenceEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureColumns(builder);
        ConfigureIndexes(builder);
    }

    private void SetTableName(EntityTypeBuilder<UserSetSequenceEntity> builder)
    {
        builder.ToTable(UserSetSequenceEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<UserSetSequenceEntity> builder)
    {
        builder.HasKey(entity => entity.UserSetSequenceId);
    }

    private void ConfigureColumns(EntityTypeBuilder<UserSetSequenceEntity> builder)
    {
        builder.Property(entity => entity.UserSetSequenceId)
            .HasColumnName("user_set_sequence_id")
            .IsRequired();

        builder.Property(entity => entity.UserId)
            .HasColumnName("user_id")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(entity => entity.NextValue)
            .HasColumnName("next_value")
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(entity => entity.LastUpdated)
            .HasColumnName("last_updated")
            .IsRequired();
    }

    private void ConfigureIndexes(EntityTypeBuilder<UserSetSequenceEntity> builder)
    {
        builder.HasIndex(entity => entity.UserId)
            .IsUnique();
    }
}
