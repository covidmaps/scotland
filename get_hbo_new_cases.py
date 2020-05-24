import pandas as pd
import numpy as np
import datetime
import os

hbo_dict = {

    1 : 'Ayrshire and Arran',
    2 : 'Borders',
    3 : 'Dumfries and Galloway',
    4 : 'Western Isles',
    5 : 'Fife',
    6 : 'Forth Valley',
    7 : 'Grampian',
    8 : 'Greater Glasgow and Clyde',
    9 : 'Highland',
    10 : 'Lanarkshire',
    11 : 'Lothian',
    12 : 'Orkney',
    13 : 'Shetland',
    14 : 'Tayside'
}

path_dict = {
                "cases" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Cumulative%20cases.csv",
                "hospital_covid" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Hospital%20patients%20-%20Confirmed.csv",
                "hospital_all" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Hospital%20patients.csv",
                "icu" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20ICU%20patients.csv",
            }


def get_hbo_data_by_date(health_board, data_type):
    df = pd.read_csv(path_dict.get(data_type))
    df = df[['Date', health_board]]
    df = df.rename(columns={'Date':'date', health_board:'value'})
    df = df.iloc[-31:]
    df['value'] = df['value'].astype(int)
    df['value'] = df[['value']].diff()

    return df


def get_all_hbo_data(path_dict, root_path):

    for i in range (1, len(hbo_dict)+1):

        # Create the dataframe
        #print(hbo_dict[i])
        df = get_hbo_data_by_date(hbo_dict[i], "cases")
        path = root_path + f"{i}_new_cases.csv"
        current_dir = os.getcwd()
        curr = os.path.dirname(os.getcwd())
        #print(curr)
        df.to_csv(current_dir + path)


if __name__ == "__main__":

    get_all_hbo_data(path_dict, "/data/hbo/")
