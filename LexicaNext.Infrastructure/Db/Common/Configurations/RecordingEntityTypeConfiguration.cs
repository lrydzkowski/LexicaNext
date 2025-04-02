using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class RecordingEntityTypeConfiguration : IEntityTypeConfiguration<RecordingEntity>
{
    public void Configure(EntityTypeBuilder<RecordingEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureRelations(builder);
        ConfigureColumns(builder);
    }

    private void SetTableName(EntityTypeBuilder<RecordingEntity> builder)
    {
        builder.ToTable(RecordingEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<RecordingEntity> builder)
    {
        builder.HasKey(entity => entity.RecordingId);
    }

    private void ConfigureRelations(EntityTypeBuilder<RecordingEntity> builder)
    {
        ConfigureRelationWithWordType(builder);
    }

    private static void ConfigureRelationWithWordType(EntityTypeBuilder<RecordingEntity> builder)
    {
        builder.HasOne(entity => entity.WordType)
            .WithMany(parent => parent.Recordings)
            .HasForeignKey(entity => entity.WordTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureColumns(EntityTypeBuilder<RecordingEntity> builder)
    {
        builder.Property(entity => entity.RecordingId)
            .HasColumnName("recording_id")
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(entity => entity.Word)
            .HasColumnName("word")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(entity => entity.WordTypeId)
            .HasColumnName("word_type_id")
            .IsRequired();

        builder.Property(entity => entity.FileName)
            .HasColumnName("file_name")
            .IsRequired()
            .HasMaxLength(200);
    }
}
