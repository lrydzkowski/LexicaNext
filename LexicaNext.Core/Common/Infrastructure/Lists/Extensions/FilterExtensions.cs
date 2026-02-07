using System.Linq.Dynamic.Core;
using System.Reflection;
using LexicaNext.Core.Common.Infrastructure.Extensions;

namespace LexicaNext.Core.Common.Infrastructure.Lists.Extensions;

public static class FilterExtensions
{
    private static ParsingConfig DynamicLinqParsingConfig { get; } = new()
    {
        ResolveTypesBySimpleName = true,
        AllowEqualsAndToStringMethodsOnObject = true
    };

    public static IQueryable<T> Filter<T>(
        this IQueryable<T> query,
        List<string> fieldsAvailableToFilter,
        Search search,
        Dictionary<string, string>? fieldNamesMapping = null
    )
    {
        if (search.Query is null)
        {
            return query;
        }

        string value = search.Query.ToLower();
        PropertyInfo[] properties = GetEntityProperties<T>();
        List<string> whereQueryParts = [];
        List<object> queryParameters = [];

        foreach (string fieldName in fieldsAvailableToFilter)
        {
            string mappedFieldName = MapFieldName(fieldName, fieldNamesMapping);
            PropertyInfo? property = properties.FirstOrDefault(
                property => property.Name.EqualsIgnoreCase(mappedFieldName)
            );
            if (property is null)
            {
                continue;
            }

            string? whereQueryPart = null;
            if (property.PropertyType == typeof(string))
            {
                whereQueryPart = GetStringWhereQuery(mappedFieldName, queryParameters.Count);
                queryParameters.Add(value);
            }
            else if (property.PropertyType == typeof(DateTimeOffset))
            {
                int clampedOffset = ClampTimezoneOffset(search.TimezoneOffsetMinutes);
                int? offsetParamIndex = null;
                if (clampedOffset != 0)
                {
                    offsetParamIndex = queryParameters.Count;
                    queryParameters.Add((double)clampedOffset);
                }

                whereQueryPart = GetDateTimeWhereQuery(mappedFieldName, queryParameters.Count, offsetParamIndex);
                queryParameters.Add(value);
            }

            if (whereQueryPart == null)
            {
                continue;
            }

            whereQueryParts.Add(whereQueryPart);
        }

        if (whereQueryParts.Count == 0)
        {
            return query;
        }

        string whereQuery = "(" + string.Join(") OR (", whereQueryParts) + ")";
        query = query.Where(DynamicLinqParsingConfig, whereQuery, queryParameters.ToArray());

        return query;
    }

    private static PropertyInfo[] GetEntityProperties<T>()
    {
        Type entityType = typeof(T);

        return entityType.GetProperties();
    }

    private static string MapFieldName(string fieldName, Dictionary<string, string>? fieldNamesMapping = null)
    {
        if (fieldNamesMapping?.TryGetValue(fieldName, out string? value) is true)
        {
            fieldName = value;
        }

        return fieldName;
    }

    private static string GetStringWhereQuery(string fieldName, int index)
    {
        return $"{fieldName}.ToLower().Contains(@{index})";
    }

    private static int ClampTimezoneOffset(int? timezoneOffsetMinutes)
    {
        if (timezoneOffsetMinutes is null)
        {
            return 0;
        }

        return Math.Clamp(timezoneOffsetMinutes.Value, -720, 840);
    }

    private static string GetDateTimeWhereQuery(string fieldName, int searchValueIndex, int? offsetIndex)
    {
        if (offsetIndex is null)
        {
            return $"{fieldName}.UtcDateTime.ToString().Contains(@{searchValueIndex})";
        }

        return $"{fieldName}.UtcDateTime.AddMinutes(@{offsetIndex}).ToString().Contains(@{searchValueIndex})";
    }
}
