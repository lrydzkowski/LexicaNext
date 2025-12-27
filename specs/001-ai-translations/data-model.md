# Data Model: AI-Generated Translations and Example Sentences

**Feature**: 001-ai-translations
**Date**: 2025-12-25

## Entity Changes

### New Entity: ExampleSentence

**Purpose**: Store AI-generated example sentences for vocabulary words.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| ExampleSentenceId | UUID | PK | Unique identifier (Guid.CreateVersion7) |
| Sentence | string | NOT NULL, max 500 chars | The example sentence text |
| Order | int | NOT NULL | Display order (0-based) |
| WordId | UUID | FK → Word, NOT NULL, CASCADE DELETE | Parent word reference |

**Relationships**:
- ExampleSentence → Word: Many-to-One (each sentence belongs to one word)
- Word → ExampleSentences: One-to-Many (each word can have multiple sentences)

### Updated Entity: Word

**Changes**: Add navigation property for example sentences.

```csharp
// Existing properties unchanged
public ICollection<ExampleSentenceEntity> ExampleSentences { get; set; } = [];
```

## Domain Models

### New: ExampleSentence (Core Layer)

```csharp
public record ExampleSentence
{
    public required string Sentence { get; init; }
    public required int Order { get; init; }
}
```

### Updated: Entry (Core Layer)

```csharp
public record Entry
{
    public required string Word { get; init; }
    public required WordType WordType { get; init; }
    public required IReadOnlyList<string> Translations { get; init; }
    public IReadOnlyList<ExampleSentence> ExampleSentences { get; init; } = []; // NEW
}
```

## Database Migration

**Migration Name**: `AddExampleSentences`

```sql
CREATE TABLE example_sentence (
    example_sentence_id UUID NOT NULL,
    sentence VARCHAR(500) NOT NULL,
    "order" INT NOT NULL,
    word_id UUID NOT NULL,
    CONSTRAINT pk_example_sentence PRIMARY KEY (example_sentence_id),
    CONSTRAINT fk_example_sentence_word FOREIGN KEY (word_id)
        REFERENCES word(word_id) ON DELETE CASCADE
);

CREATE INDEX ix_example_sentence_word_id ON example_sentence(word_id);
```

## EF Core Configuration

### ExampleSentenceEntityTypeConfiguration

```csharp
public class ExampleSentenceEntityTypeConfiguration
    : IEntityTypeConfiguration<ExampleSentenceEntity>
{
    public void Configure(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        builder.ToTable("example_sentence");

        builder.HasKey(e => e.ExampleSentenceId);

        builder.Property(e => e.ExampleSentenceId)
            .HasColumnName("example_sentence_id");

        builder.Property(e => e.Sentence)
            .HasColumnName("sentence")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.Order)
            .HasColumnName("order")
            .IsRequired();

        builder.Property(e => e.WordId)
            .HasColumnName("word_id")
            .IsRequired();

        builder.HasOne(e => e.Word)
            .WithMany(w => w.ExampleSentences)
            .HasForeignKey(e => e.WordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.WordId);
    }
}
```

## State Transitions

### ExampleSentence Lifecycle

```
[No Sentences] → Generate → [Has Sentences]
[Has Sentences] → Regenerate → [New Sentences] (replaces previous)
[Has Sentences] → Delete Word → [Cascade Deleted]
```

### Translation Update Flow (unchanged structure, new behavior)

```
[Manual Translations] → Generate → [AI Translations] (replaces previous)
```

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| ExampleSentence | Sentence | Required, 1-500 characters |
| ExampleSentence | Order | >= 0 |
| GenerateTranslationsRequest | Word | Required, non-empty |
| GenerateTranslationsRequest | WordType | Required, valid enum value |
| GenerateTranslationsRequest | Count | 1-10, default 3 |
| GenerateExampleSentencesRequest | Word | Required, non-empty |
| GenerateExampleSentencesRequest | WordType | Required, valid enum value |
| GenerateExampleSentencesRequest | Count | 1-10, default 3 |

## Data Volume Assumptions

- Average sentences per word: 3 (default)
- Maximum sentences per word: 10
- Sentence length: 10-20 words (~100-200 characters)
- No additional indexing beyond word_id FK (low cardinality per word)
