import pandas as pd
import numpy as np
import datetime
import os

path_dict = {
                "cases" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Cumulative%20cases.csv",
                "hospital_covid" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Hospital%20patients%20-%20Confirmed.csv",
                "hospital_all" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20Hospital%20patients.csv",
                "icu" : "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20ICU%20patients.csv",
            }

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

def convert_date_to_day(date):
    date_list = date.split('-')
    date_num = list(map(int, date_list))
    a_date = datetime.date(date_num[0], date_num[1], date_num[2])
    day_of_year = (a_date - datetime.date(date_num[0], 1, 1)).days + 1
    return day_of_year


def get_hbo_data_by_date(health_board, data_type):
    df = pd.read_csv(path_dict.get(data_type))
    df = df[['Date', health_board]]
    df = df.rename(columns={'Date':'date', health_board:'value'})
    df = df.iloc[-31:]
    return df


def get_all_hbo_data(path_dict, root_path):

    for i in range (1, len(hbo_dict)+1):
        for data_type in path_dict.keys():

            # Create the dataframe
            #print(hbo_dict[i])
            df = get_hbo_data_by_date(hbo_dict[i], data_type)
            path = root_path + f"{i}_{data_type}.csv"
            current_dir = os.getcwd()
            curr = os.path.dirname(os.getcwd())
            #print(curr)
            df.to_csv(current_dir + path)


def get_total_hbo_cases(path_dict, root_path):
    totals = {}

    totalArray = []

    for i in range (1, len(hbo_dict)+1):
        df = get_hbo_data_by_date(hbo_dict[i], 'cases')

        # Convert value from object to int for summing
        df['value'] = df['value'].astype(str).astype(int)

        # Add value to totalCases array
        totalArray.append(df['value'].tail(1).sum())

    # Total number of cases
    totalCasesSum = np.sum(totalArray)
    totals['cases'] = [totalCasesSum]


    df_totals = pd.DataFrame(totals, columns = ['cases'])#, 'hospital_covid', 'hospital_all', 'icu'])

    current_dir = os.getcwd()

    df_totals.to_csv(current_dir + root_path + "totals.csv")

    print (df_totals)


def get_all_hbo_data_dict(hbo_list, path_dict, root_path):

    for i in range (1, len(hbo_dict)+1):
        for data_type in path_dict.keys():

            # Create the dataframe
            print(hbo_dict[i])
            df = get_hbo_data_by_date(hbo_dict[i], data_type)
            path = root_path + f"{i}_{data_type}.csv"
            current_dir = os.getcwd()
            curr = os.path.dirname(os.getcwd())
            #print(curr)
            df.to_csv(current_dir + path)


if __name__ == "__main__":

    df_icu = pd.read_csv("https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20ICU%20patients.csv")

    hbo_list = list(df_icu.columns.values)
    root_path = "/data/hbo/"

    get_all_hbo_data(path_dict, root_path)
    get_total_hbo_cases(path_dict, root_path)
