import pandas as pd
import numpy as np
import zipfile
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import datetime
import urllib.request, urllib.error
import os.path

path = "https://www.nrscotland.gov.uk/files//statistics/covid19/"



def get_week_num():
    return datetime.date.today().isocalendar()[1]


def create_all_data_df(path):

    dict_id = {"S12000033":"Aberdeen City","S12000034":"Aberdeenshire","S12000041":"Angus","S12000035":"Argyll and Bute","S12000036":"City of Edinburgh","S12000005":"Clackmannanshire","S12000006":"Dumfries and Galloway","S12000042":"Dundee City","S12000008":"East Ayrshire","S12000045":"East Dunbartonshire","S12000010":"East Lothian","S12000011":"East Renfrewshire","S12000014":"Falkirk","S12000015":"Fife","S12000046":"Glasgow City","S12000017":"Highland","S12000018":"Inverclyde","S12000019":"Midlothian","S12000020":"Moray","S12000013":"Na h-Eileanan Siar","S12000021":"North Ayrshire","S12000044":"North Lanarkshire","S12000023":"Orkney Islands","S12000024":"Perth and Kinross","S12000038":"Renfrewshire","S12000026":"Scottish Borders","S12000027":"Shetland Islands","S12000028":"South Ayrshire","S12000029":"South Lanarkshire","S12000030":"Stirling","S12000039":"West Dunbartonshire","S12000040":"West Lothian"}

    df_death_locations = get_death_locations_df(path, 20)

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


def wrapper():

    df_all = create_all_data_df(path)
    df_all = convert_all_types(df_all)


    headings = ['lad', 'covid_deaths_carehome', 'covid_deaths_non-institution', 'covid_deaths_hospital', 'covid_deaths_other', 'covid_deaths_total', 'all_deaths_carehome', 'all_deaths_non-institution', 'all_deaths_hospital', 'all_deaths_other', 'all_deaths_total']
    df_all[headings].replace({',':''}, regex=True)
    df_all.to_json('table_data_updated.json')
