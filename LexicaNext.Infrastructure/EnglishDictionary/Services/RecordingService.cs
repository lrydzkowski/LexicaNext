using HtmlAgilityPack;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRecording.Interfaces;

namespace LexicaNext.Infrastructure.EnglishDictionary.Services;

internal class RecordingService : IScopedService, IRecordingApi
{
    private readonly IApiClient _apiClient;

    public RecordingService(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<byte[]?> GetFileAsync(
        string word,
        WordType wordType,
        CancellationToken cancellationToken = default
    )
    {
        string? pageContent = await _apiClient.GetPageAsync(word, cancellationToken);
        if (pageContent is null)
        {
            return null;
        }

        string? link = GetLink(word, wordType, pageContent);
        if (link is null)
        {
            return null;
        }

        byte[]? recordingFile = await _apiClient.DownloadFileAsync(link, cancellationToken);

        return recordingFile;
    }

    private string? GetLink(string word, WordType wordType, string pageContent)
    {
        string? link = null;

        HtmlDocument htmlDoc = new();
        htmlDoc.LoadHtml(pageContent);

        HtmlNodeCollection wordNodes = htmlDoc.DocumentNode.SelectNodes("//span[contains(@class, 'headword')]");
        foreach (HtmlNode? wordNode in wordNodes)
        {
            if (!wordNode.HasChildNodes)
            {
                continue;
            }

            string? foundWord = wordNode.ChildNodes[0].InnerText?.Trim().ToLower();
            if (foundWord is null || !word.Equals(foundWord, StringComparison.InvariantCultureIgnoreCase))
            {
                continue;
            }

            HtmlNode? nextNode = wordNode.ParentNode.NextSibling;
            if (!nextNode.HasChildNodes)
            {
                continue;
            }

            string? foundWordTypeLabel = nextNode.ChildNodes[0].InnerText?.Trim().ToLower();
            if (foundWordTypeLabel is null)
            {
                continue;
            }

            WordType foundWordType = MapToWordType(foundWordTypeLabel);
            if (foundWordType == WordType.None || foundWordType != wordType)
            {
                continue;
            }

            link = wordNode.ParentNode.ParentNode.SelectSingleNode(".//span[contains(@class, 'us')]")
                ?.SelectSingleNode(".//source[@type='audio/mpeg']")
                ?.GetAttributeValue("src", "");
            if (link != null)
            {
                break;
            }
        }

        return link;
    }

    private WordType MapToWordType(string wordTypeLabel)
    {
        return wordTypeLabel switch
        {
            "noun" => WordType.Noun,
            "verb" => WordType.Verb,
            "adjective" => WordType.Adjective,
            "adverb" => WordType.Adverb,
            _ => WordType.None
        };
    }
}
