using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class TestEntityTypeConfiguration : IEntityTypeConfiguration<TestEntity>
{
    public void Configure(EntityTypeBuilder<TestEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureColumns(builder);
    }

    private void SetTableName(EntityTypeBuilder<TestEntity> builder)
    {
        builder.ToTable(TestEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<TestEntity> builder)
    {
        builder.HasKey(entity => entity.TestId);
    }

    private void ConfigureColumns(EntityTypeBuilder<TestEntity> builder)
    {
        builder.Property(entity => entity.TestId)
            .HasColumnName("test_id")
            .IsRequired();

        builder.Property(entity => entity.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);
    }
}
