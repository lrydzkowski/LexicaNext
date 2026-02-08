using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.CustomTypeProviders;
using System.Reflection;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Lists;

namespace LexicaNext.Infrastructure.Db.Extensions;

public static class FilterExtensions
{
    private static ParsingConfig DynamicLinqParsingConfig { get; } = new()
    {
        ResolveTypesBySimpleName = true,
        AllowEqualsAndToStringMethodsOnObject = true,
        CustomTypeProvider = new DynamicLinqTypeProvider()
    };

    private class DynamicLinqTypeProvider : IDynamicLinqCustomTypeProvider
    {
        private static readonly HashSet<Type> CustomTypes = [typeof(PostgresFunctions)];

        public HashSet<Type> GetCustomTypes() => CustomTypes;

        public Dictionary<Type, List<MethodInfo>> GetExtensionMethods() => new();

        public Type? ResolveType(string typeName) =>
            CustomTypes.FirstOrDefault(t => t.FullName == typeName);

        public Type? ResolveTypeBySimpleName(string simpleTypeName) =>
            CustomTypes.FirstOrDefault(t => t.Name == simpleTypeName);
    }

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
            else if (property.PropertyType == typeof(DateTimeOffset)
                     || property.PropertyType == typeof(DateTimeOffset?))
            {
                bool isNullable = property.PropertyType == typeof(DateTimeOffset?);
                string? timeZoneId = GetValidTimeZoneId(search.TimeZoneId);

                if (timeZoneId is not null)
                {
                    int tzParamIndex = queryParameters.Count;
                    queryParameters.Add(timeZoneId);
                    whereQueryPart = GetDateTimeWithTimezoneWhereQuery(
                        mappedFieldName, queryParameters.Count, tzParamIndex, isNullable);
                    queryParameters.Add(value);
                }
                else
                {
                    whereQueryPart = GetDateTimeUtcWhereQuery(mappedFieldName, queryParameters.Count, isNullable);
                    queryParameters.Add(value);
                }
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

    private static string? GetValidTimeZoneId(string? timeZoneId)
    {
        if (timeZoneId is null)
        {
            return null;
        }

        if (TimeZoneInfo.TryFindSystemTimeZoneById(timeZoneId, out _))
        {
            return timeZoneId;
        }

        return null;
    }

    private static string GetDateTimeWithTimezoneWhereQuery(
        string fieldName, int searchValueIndex, int tzParamIndex, bool isNullable)
    {
        string accessor = isNullable ? $"{fieldName}.Value" : fieldName;
        string dateExpression =
            $"PostgresFunctions.Timezone(@{tzParamIndex}, {accessor}).ToString().Substring(0, 19)";
        string query = $"{dateExpression}.Contains(@{searchValueIndex})";

        if (isNullable)
        {
            return $"{fieldName}.HasValue AND {query}";
        }

        return query;
    }

    private static string GetDateTimeUtcWhereQuery(string fieldName, int searchValueIndex, bool isNullable)
    {
        string accessor = isNullable ? $"{fieldName}.Value" : fieldName;
        string dateExpression = $"{accessor}.UtcDateTime.ToString().Substring(0, 19)";
        string query = $"{dateExpression}.Contains(@{searchValueIndex})";

        if (isNullable)
        {
            return $"{fieldName}.HasValue AND {query}";
        }

        return query;
    }
}
