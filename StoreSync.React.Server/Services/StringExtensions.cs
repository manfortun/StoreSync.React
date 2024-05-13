namespace StoreSync.React.Server.Services;

public static class StringExtensions
{
    public static string ToSimpleString(this string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;

        return string.Join(" ", value.ToLower().Split(' '));
    }
}
