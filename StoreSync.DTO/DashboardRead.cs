namespace StoreSync.DTO;

public class DashboardRead
{
    public double AllTimeSales { get; set; }
    public double AllTimeAverage { get; set; }
    public double NoOfDaysOperating { get; set; }
    public List<ChartDataRead> DataPoints { get; set; }
}
