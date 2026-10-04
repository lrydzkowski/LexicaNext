using System.Globalization;
using LexicaNext.Core;
using LexicaNext.Core.Features.Sets.CreateSet;
using LexicaNext.Core.Features.Words.CreateWord;
using LexicaNext.Core.Features.Sets.DeleteSets;
using LexicaNext.Core.Features.Words.DeleteWords;
using LexicaNext.Core.Features.Sentences.GenerateExampleSentences;
using LexicaNext.Core.Features.Translations.GenerateTranslations;
using LexicaNext.Core.Features.Answers.RegisterAnswer;
using LexicaNext.Core.Features.Sets.UpdateSet;
using LexicaNext.Core.Features.Words.UpdateWord;
using LexicaNext.Core.Features.App.GetAppStatus;
using LexicaNext.Core.Features.Sets.GetProposedSetName;
using LexicaNext.Core.Features.Practice.GetRandomOpenQuestionsPracticeEntries;
using LexicaNext.Core.Features.Recordings.GetRecording;
using LexicaNext.Core.Features.Sets.GetSet;
using LexicaNext.Core.Features.Sets.GetSets;
using LexicaNext.Core.Features.Practice.GetWeakestOpenQuestionsPracticeEntries;
using LexicaNext.Core.Features.Words.GetWord;
using LexicaNext.Core.Features.Words.GetWords;
using LexicaNext.Core.Features.Words.GetWordSets;
using LexicaNext.Core.Features.Answers.GetWordsStatistics;
using LexicaNext.Infrastructure;
using LexicaNext.WebApp;
using LexicaNext.WebApp.Security;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddWebAppServices(builder.Configuration);
builder.Services.AddCoreServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

CultureInfo culture = new("en-US");
CultureInfo.DefaultThreadCurrentCulture = culture;
CultureInfo.DefaultThreadCurrentUICulture = culture;

WebApplication app = builder.Build();

app.UseSecurityHeaders(builder.Configuration);
app.UseApiSecurityHeaders();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => { options.SwaggerEndpoint("/openapi/v1.json", "v1"); });
}

app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRateLimiter();
app.UseStaticFiles();

app.MapGetAppStatusEndpoint();

app.MapGetSetsEndpoint();
app.MapGetSetEndpoint();
app.MapGetProposedSetNameEndpoint();
app.MapCreateSetEndpoint();
app.MapUpdateSetEndpoint();
app.MapDeleteSetsEndpoint();

app.MapGetWordsEndpoint();
app.MapGetWordEndpoint();
app.MapCreateWordEndpoint();
app.MapUpdateWordEndpoint();
app.MapDeleteWordsEndpoint();
app.MapGetWordSetsEndpoint();
app.MapGenerateTranslationsEndpoint();
app.MapGenerateExampleSentencesEndpoint();

app.MapGetRecordingEndpoint();

app.MapRegisterAnswerEndpoint();
app.MapGetWordsStatisticsEndpoint();

app.MapGetRandomOpenQuestionsPracticeEntriesEndpoint();
app.MapGetWeakestOpenQuestionsPracticeEntriesEndpoint();

app.MapFallbackToFile("index.html");

app.Run();

public partial class Program
{
}
