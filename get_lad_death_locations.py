import pandas as pd
import numpy as np
import zipfile
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import datetime
import urllib.request, urllib.error
import os.path
import datetime

path = "https://www.nrscotland.gov.uk/files//statistics/covid19/"

data = [['S12000033', 'Aberdeen City'],
  ['S12000034', 'Aberdeenshire'],
  ['S12000041', 'Angus council'],
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

lad_dict = {"S12000033":"Aberdeen City","S12000034":"Aberdeenshire","S12000041":"Angus","S12000035":"Argyll and Bute","S12000036":"City of Edinburgh","S12000005":"Clackmannanshire","S12000006":"Dumfries and Galloway","S12000042":"Dundee City","S12000008":"East Ayrshire","S12000045":"East Dunbartonshire","S12000010":"East Lothian","S12000011":"East Renfrewshire","S12000014":"Falkirk","S12000015":"Fife","S12000046":"Glasgow City","S12000017":"Highland","S12000018":"Inverclyde","S12000019":"Midlothian","S12000020":"Moray","S12000013":"Na h-Eileanan Siar","S12000021":"North Ayrshire","S12000044":"North Lanarkshire","S12000023":"Orkney Islands","S12000024":"Perth and Kinross","S12000038":"Renfrewshire","S12000026":"Scottish Borders","S12000027":"Shetland Islands","S12000028":"South Ayrshire","S12000029":"South Lanarkshire","S12000030":"Stirling","S12000039":"West Dunbartonshire","S12000040":"West Lothian"}


def get_week_num():
    return datetime.date.today().isocalendar()[1]


def get_death_locations_df(path, week):

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
        print(week)
        url = path + "covid-deaths-data-week-%d.zip" % week-1
        conn = urllib.request.urlopen(url)
        zipfile = ZipFile(BytesIO(conn.read()))


        df_location = pd.read_csv(zipfile.open('covid-deaths-data-week-%d_Table 3 - deaths by location.csv' % week), header=3, encoding='unicode-escape')

        idx_start = np.where(df_location['Unnamed: 0'] == 'Aberdeen City')[0][0]
        print(idx_start)
        idx_end = idx_start + 32
        df_location_trimmed = df_location.iloc[idx_start:idx_end, :-2]
        return df_location_trimmed


def get_data_for_location(df_locations_trimmed, area_name):

    df_area = df_locations_trimmed.set_index('Unnamed: 0')
    df_area_solo = df_area.loc[[area_name]]
    df_area_solo2 = df_area_solo.iloc[:,0:3]
    df_transpose = df_area_solo2.transpose()
    df_transpose = df_transpose.reset_index()
    df_transpose = df_transpose.rename(columns={'index':'Country', area_name:'Value'})

    return df_transpose


def populate_location_deaths(df_locations_trimmed, data_dict, root_path):

    for x in data_dict.keys():
        df_area = get_data_for_location(df_locations_trimmed, data_dict.get(x))
        path = root_path + f"{x}.csv"
        print(path)
        current_dir = os.getcwd()
        curr = os.path.dirname(os.getcwd())
        #print(curr)
        df_area.to_csv(current_dir + path)



def wrapper():

    week = get_week_num()-1
    df_death_locations_trimmed = get_death_locations_df(path, week)
    populate_location_deaths(df_death_locations_trimmed, lad_dict, "/data/lad/loc_deaths/")


if __name__ == "__main__":

    wrapper()
