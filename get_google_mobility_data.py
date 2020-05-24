import pandas as pd
import datetime
import os

data = [['S12000033', 'Aberdeen City'],
  ['S12000034', 'Aberdeenshire'],
  ['S12000041', 'Angus Council'],
  ['S12000035', 'Argyll and Bute Council'],
  ['S12000036', 'Edinburgh'],
  ['S12000005', 'Clackmannanshire'],
  ['S12000006', 'Dumfries and Galloway'],
  ['S12000042', 'Dundee City Council'],
  ['S12000008', 'East Ayrshire Council'],
  ['S12000045', 'East Dunbartonshire Council'],
  ['S12000010', 'East Lothian Council'],
  ['S12000011', 'East Renfrewshire Council'],
  ['S12000014', 'Falkirk'],
  ['S12000015', 'Fife'],
  ['S12000046', 'Glasgow City'],
  ['S12000017', 'Highland Council'],
  ['S12000018', 'Inverclyde'],
  ['S12000019', 'Midlothian'],
  ['S12000020', 'Moray'],
  ['S12000013', 'Na h-Eileanan an Iar'],
  ['S12000021', 'North Ayrshire Council'],
  ['S12000044', 'North Lanarkshire'],
  ['S12000023', 'Orkney'],
  ['S12000024', 'Perth and Kinross'],
  ['S12000038', 'Renfrewshire'],
  ['S12000026', 'Scottish Borders'],
  ['S12000027', 'Shetland Islands'],
  ['S12000028', 'South Ayrshire Council'],
  ['S12000029', 'South Lanarkshire'],
  ['S12000030', 'Stirling'],
  ['S12000039', 'West Dunbartonshire Council'],
  ['S12000040', 'West Lothian']]


def convert_date_to_day(date):
    date_list = date.split('-')
    date_num = list(map(int, date_list))
    a_date = datetime.date(date_num[0], date_num[1], date_num[2])
    day_of_year = (a_date - datetime.date(date_num[0], 1, 1)).days + 1
    return day_of_year


def get_lad_data(df_google, area_name):
    df_sub_region = df_google.copy()
    df_sub_region.set_index('sub_region_1', inplace=True)
    df_area = df_sub_region.loc[area_name, ['date', 'retail_and_recreation_percent_change_from_baseline', 'grocery_and_pharmacy_percent_change_from_baseline', 'parks_percent_change_from_baseline', 'transit_stations_percent_change_from_baseline', 'workplaces_percent_change_from_baseline', 'residential_percent_change_from_baseline']]
    df_area.reset_index(inplace=True, drop=True)
    df_area['time'] = df_area['date'].apply(lambda x : convert_date_to_day(x))
    df_area = df_area.drop(columns=['date'])
    df_area = df_area.set_index('time')
    df_area = df_area.reset_index(inplace=False)
    df_area = df_area.set_index('time')
    #df_area = df_area.rename(columns={'retail_and_recreation_percent_change_from_baseline': 'valueA', 'grocery_and_pharmacy_percent_change_from_baseline': 'valueB', 'parks_percent_change_from_baseline':'valueC', 'transit_stations_percent_change_from_baseline':'valueD', 'workplaces_percent_change_from_baseline':'valueE', 'residential_percent_change_from_baseline':'valueF'})
    return df_area[-90:]


"As input give the new dataframe with country region as index"
def get_uk_average(df_google):
    df_country = df_google.copy()
    df_country.set_index('country_region', inplace=True)
    df_area = df_country.loc['United Kingdom', ['date', 'retail_and_recreation_percent_change_from_baseline', 'grocery_and_pharmacy_percent_change_from_baseline', 'parks_percent_change_from_baseline', 'transit_stations_percent_change_from_baseline', 'workplaces_percent_change_from_baseline', 'residential_percent_change_from_baseline']]
    df_area.reset_index(inplace=True, drop=True)
    df_area['time'] = df_area['date'].apply(lambda x : convert_date_to_day(x))
    df_area = df_area.drop(columns=['date'])
    df_area = df_area.set_index('time')
    df_area = df_area.reset_index(inplace=False)
    df_area = df_area.rename(columns={'retail_and_recreation_percent_change_from_baseline': 'uk_retail_and_recreation_percent_change_from_baseline', 'grocery_and_pharmacy_percent_change_from_baseline': 'uk_grocery_and_pharmacy_percent_change_from_baseline', 'parks_percent_change_from_baseline':'uk_parks_percent_change_from_baseline', 'transit_stations_percent_change_from_baseline':'uk_transit_stations_percent_change_from_baseline', 'workplaces_percent_change_from_baseline':'uk_workplaces_percent_change_from_baseline', 'residential_percent_change_from_baseline':'uk_residential_percent_change_from_baseline'})
    df_area = df_area.set_index('time')
    return df_area[-90:]


def combine_uk_average(df_sub_region, df_uk):
    result = pd.concat([df_sub_region, df_uk], axis=1)
    result = result.reset_index()
    return result


def populate_all_google_data(df_google, regions, root_path):

    for x in data:
        df_sub_region = get_lad_data(df_google, x[1])
        df_uk = get_uk_average(df_google)
        df_result = combine_uk_average(df_sub_region, df_uk)
        path = root_path + f"{x[0]}.csv"
        print(path)
        current_dir = os.getcwd()
        curr = os.path.dirname(os.getcwd())
        #print(curr)
        df_result.to_csv(current_dir + path)


def wrapper():

    df_google = pd.read_csv("https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv")
    populate_all_google_data(df_google, data, '/data/g_mobility/')


if __name__ == "__main__":

    wrapper()
