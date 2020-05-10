import pandas as pd
import numpy as np
import zipfile
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import datetime
import urllib.request, urllib.error

input_path = "https://www.nrscotland.gov.uk/files//statistics/covid19/"
output_path = "https://raw.githubusercontent.com/markjswan/covid-maps/master/json/sco/"

dict_id = {"S12000033":"Aberdeen City","S12000034":"Aberdeenshire","S12000041":"Angus","S12000035":"Argyll and Bute","S12000036":"City of Edinburgh","S12000005":"Clackmannanshire","S12000006":"Dumfries and Galloway","S12000042":"Dundee City","S12000008":"East Ayrshire","S12000045":"East Dunbartonshire","S12000010":"East Lothian","S12000011":"East Renfrewshire","S12000014":"Falkirk","S12000015":"Fife","S12000046":"Glasgow City","S12000017":"Highland","S12000018":"Inverclyde","S12000019":"Midlothian","S12000020":"Moray","S12000013":"Na h-Eileanan Siar","S12000021":"North Ayrshire","S12000044":"North Lanarkshire","S12000023":"Orkney Islands","S12000024":"Perth and Kinross","S12000038":"Renfrewshire","S12000026":"Scottish Borders","S12000027":"Shetland Islands","S12000028":"South Ayrshire","S12000029":"South Lanarkshire","S12000030":"Stirling","S12000039":"West Dunbartonshire","S12000040":"West Lothian"}


# Method 1.1: Get the current week number
def get_week_num():
    return datetime.date.today().isocalendar()[1]


def get_all_deaths_df(path):

    # Try get get the most recent data
    try:
        url = path + "covid-deaths-data-week-%d.zip" % get_week_num()
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]


        return df_all_deaths_trimmed, df_covid_deaths_trimmed

    # If error, then get last week response
    except urllib.error.HTTPError as e:
        url = path + "covid-deaths-data-week-%d.zip" % (get_week_num()-1)
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]


        return df_all_deaths_trimmed


def get_covid_deaths_df(path):

    # Try get get the most recent data
    try:
        url = path + "covid-deaths-data-week-%d.zip" % get_week_num()
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]


        return df_all_deaths_trimmed, df_covid_deaths_trimmed

    # If error, then get last week response
    except urllib.error.HTTPError as e:
        url = path + "covid-deaths-data-week-%d.zip" % (get_week_num()-1)
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')
        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-18_Table 3 - deaths by location.csv'), encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]



        return df_covid_deaths_trimmed


def get_death_locations_df(path):

    # Try get get the most recent data
    try:
        url = path + "covid-deaths-data-week-17.zip"
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')
        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 3 - deaths by location.csv'), header=3, encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]
        df_location_trimmed = df_location.iloc[21:53, :-2]


        return df_location_trimmed

    # If error, then get last week response
    except urllib.error.HTTPError as e:
        url = path + "covid-deaths-data-week-17.zip"
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_covid_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 1 - COVID deaths.csv'),header = 3, encoding='unicode-escape')
        df_all_deaths = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 2 - All deaths.csv'),header = 3, encoding='unicode-escape')
        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-17_Table 3 - deaths by location.csv'), header=3, encoding='unicode-escape')

        df_covid_deaths_trimmed = df_covid_deaths.iloc[48:80, 1:get_week_num()+1]
        df_all_deaths_trimmed = df_all_deaths.iloc[50:82, 1:get_week_num()+1]
        df_location_trimmed = df_location.iloc[21:53, :-2]

        return df_location_trimmed


# This one will dynamically resize depending on the input
def get_death_locations_df_NEW(path, week):

    # Try get get the most recent data
    try:
        url = path + "covid-deaths-data-week-%d.zip" % week
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))

        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-%d_Table 3 - deaths by location.csv' % week), header=3, encoding='unicode-escape')
        idx_start = np.where(df_location['Unnamed: 0'] == 'Aberdeen City')[0][0]
        idx_end = idx_start + 32
        df_location_trimmed = df_location.iloc[idx_start:idx_end, :-2]


        return df_location_trimmed

    # If error, then get last week response
    except urllib.error.HTTPError as e:
        url = path + "covid-deaths-data-week-%d.zip" % week-1
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))


        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-%d_Table 3 - deaths by location.csv' % week), header=3, encoding='unicode-escape')

        idx_start = np.where(df_location['Unnamed: 0'] == 'Aberdeen City')[0][0]
        print(idx_start)
        idx_end = idx_start + 32
        df_location_trimmed = df_location.iloc[idx_start:idx_end, :-2]
        return df_location_trimmed


def create_all_data_df(path):

    df_death_locations = get_death_locations_df(path)

    df_all = df_death_locations.reset_index(drop=True, inplace=False)
    headings = ['lad', 'covid_deaths_carehome', 'covid_deaths_non-institution', 'covid_deaths_hospital', 'covid_deaths_other', 'covid_deaths_total', 'blank1', 'all_deaths_carehome', 'all_deaths_non-institution', 'all_deaths_hospital', 'all_deaths_other', 'all_deaths_total']
    df_all.columns = headings
    # Add the ratios

    df_all['ratio_hospital_death_covid'] = (df_all['covid_deaths_hospital'].str.replace(',', '').astype(float) / df_all['all_deaths_hospital'].str.replace(',', '').astype(float)) * 100
    df_all['ratio_carehome_death_covid'] = (df_all['covid_deaths_carehome'].str.replace(',', '').astype(float) / df_all['all_deaths_carehome'].str.replace(',', '').astype(float)) * 100
    df_all['ratio_total_death_covid'] = (df_all['covid_deaths_total'].str.replace(',', '').astype(float) / df_all['all_deaths_total'].str.replace(',', '').astype(float)) * 100
    df_all = df_all.drop(['blank1'], axis=1)
    df_all = df_all.round(1)
    df_all['id'] = dict_id.keys()
    df_all = df_all.set_index('id')
    return df_all


def convert_all_types(df_all):

    df_all['covid_deaths_carehome'] = df_all['covid_deaths_carehome'].astype(int)
    df_all['covid_deaths_non-institution'] = df_all['covid_deaths_non-institution'].astype(int)
    df_all['covid_deaths_hospital'] = df_all['covid_deaths_hospital'].str.replace(',', '').astype(float)
    df_all['covid_deaths_other'] = df_all['covid_deaths_other'].astype(int)
    df_all['covid_deaths_total'] = df_all['covid_deaths_total'].astype(int)
    df_all['all_deaths_carehome'] = df_all['all_deaths_carehome'].astype(int)
    df_all['all_deaths_non-institution'] = df_all['all_deaths_non-institution'].astype(float)
    df_all['all_deaths_hospital'] = df_all['all_deaths_hospital']
    df_all['all_deaths_other'] = df_all['all_deaths_other'].astype(int)
    df_all['all_deaths_total'] = df_all['all_deaths_total'].str.replace(',', '').astype(float)
    df_all['all_deaths_hospital'] = df_all['all_deaths_hospital'].str.replace(',', '').astype(float)
    df_all['all_deaths_other'] = df_all['all_deaths_other'].astype(int)

    return df_all


def send_df_as_json(df_all_data, output_path):
    json_output = df_all_data.to_json(output_path)
    return


def wrapper(input_path, output_path):

    df_all = create_all_data_df(input_path)
    df_all_clean = convert_all_types(df_all)
    df_all_clean.to_json('new2_json_test.json')


if __name__ == "__main__":

    wrapper(input_path, output_path)
