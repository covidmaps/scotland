import pandas as pd
import numpy as np
import zipfile
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
from urllib.error import HTTPError
import datetime
import urllib.request, urllib.error
import os.path
import datetime

path = "https://www.nrscotland.gov.uk/files//statistics/covid19/"
lad_dict = {"S12000033":"Aberdeen City","S12000034":"Aberdeenshire","S12000041":"Angus","S12000035":"Argyll and Bute","S12000036":"City of Edinburgh","S12000005":"Clackmannanshire","S12000006":"Dumfries and Galloway","S12000042":"Dundee City","S12000008":"East Ayrshire","S12000045":"East Dunbartonshire","S12000010":"East Lothian","S12000011":"East Renfrewshire","S12000014":"Falkirk","S12000015":"Fife","S12000046":"Glasgow City","S12000017":"Highland","S12000018":"Inverclyde","S12000019":"Midlothian","S12000020":"Moray","S12000013":"Na h-Eileanan Siar","S12000021":"North Ayrshire","S12000044":"North Lanarkshire","S12000023":"Orkney Islands","S12000024":"Perth and Kinross","S12000038":"Renfrewshire","S12000026":"Scottish Borders","S12000027":"Shetland Islands","S12000028":"South Ayrshire","S12000029":"South Lanarkshire","S12000030":"Stirling","S12000039":"West Dunbartonshire","S12000040":"West Lothian"}


def get_week_num():
    return datetime.date.today().isocalendar()[1]


def convert_dates(old_date):
    date_object = datetime.datetime.strptime(old_date, '%d-%b-%y')
    new_format = date_object.strftime("%Y-%m-%d")
    return new_format


def get_total_num_covid_deaths_per_week(path):

    week_num = get_week_num()-1
    url = path + "covid-deaths-data-week-%d.zip" % week_num
    try:
        conn = urllib.request.urlopen(url)
        if conn.getcode() == 200:

            zipfile = ZipFile(BytesIO(conn.read()))
            data_table_path = 'covid-deaths-data-week-%d_Table 1 - COVID deaths.csv' % week_num
            print(data_table_path)
            idx_start = np.where(df_covid_deaths['Unnamed: 1'] == 'Aberdeen City')[0][0]
            idx_end = idx_start + 32
            df_covid_deaths_trimmed = df_covid_deaths.iloc[idx_start:idx_end,1:week_num+2]
            df_covid_deaths_trimmed = df_covid_deaths_trimmed.set_index('Unnamed: 1')

            return df_covid_deaths_trimmed
    
    # Catch error and print to shell
    except urllib.error.HTTPError as err:
        print("HTTP Error: " + str(err.code))
    

def get_total_deaths_for_lad(df_covid_deaths_per_week, lad_name):

    df_lad = df_covid_deaths_per_week.loc[[lad_name]].transpose()
    df_lad.reset_index(inplace=True, drop = False)
    df_lad = df_lad.rename(columns={'index':'date', lad_name:'value'})
    first_death_idx = df_lad.ne(0).idxmax()[1]
    df_lad['date'] = df_lad['date'].apply(lambda x : convert_dates(x))

    return df_lad.loc[first_death_idx:]


def populate_total_num_covid_deaths_per_week(df_covid_deaths_per_week, lad_dict, root_path):

    for lad in lad_dict.keys():

        df_lad = get_total_deaths_for_lad(df_covid_deaths_per_week, lad_dict.get(lad))
        path = root_path + f"{lad}.csv"
        current_dir = os.getcwd()
        curr = os.path.dirname(os.getcwd())
        df_lad.to_csv(current_dir + path)


def wrapper():

    df_covid_deaths_per_week = get_total_num_covid_deaths_per_week(path)

    # Only continue with data handling if data was successfuly retrieved
    if (df_covid_deaths_per_week is None):
        print ("Stopping Execution")
    else:
        populate_total_num_covid_deaths_per_week(df_covid_deaths_per_week, lad_dict, '/data/lad/total_covid_deaths/')


if __name__ == "__main__":
    wrapper()
