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

path_test = "https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scotland%20-%20Testing.csv"

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


def get_hbo_data_by_date(health_board, data_type, samples=-31):
    df = pd.read_csv(path_dict.get(data_type))
    df = df[['Date', health_board]]
    df = df.rename(columns={'Date':'date', health_board:'value'})
    if (samples == -31):
        return df.iloc[samples:]
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
    totalArray = {}

    newCasesTotal = []
    icuTotals = []

    # Get total COVID-19 cases
    for i in range (1, len(hbo_dict)+1):

        # Get total COVID-19 cumulative cases
        df = get_hbo_data_by_date(hbo_dict[i], 'cases', 0)

        # On first run through create the array that will store all totals
        # for each day
        if (i == 1):
            totalArray = np.zeros(len(df.index))

        # Convert value from object to int for summing
        df['value'] = df['value'].replace({'\*': '0'}, regex=True)
        df['value'] = df['value'].astype(str).astype(int)

        # Easiest to convert 'df' to numpy array for adding the value of each
        # date with that of every health board and then saving the result as csv
        numpyDF = df.to_numpy()
        values = df['value'].to_numpy()
        totalArray = np.add(totalArray,values)

        # Get total COVID-19 cases today
        lastTwo = df['value'].tail(2)
        newCasesTotal.append(lastTwo.iloc[1] - lastTwo.iloc[0])

        # Get total ICU beds occupied
        df_icu = get_hbo_data_by_date(hbo_dict[i], 'icu')
        latestNumber = df_icu['value'].tail(1)
        latestNumber.astype(str)

        # Filter out '*' terms
        if (latestNumber.iloc[0] != '*'):
            icuTotals.append(latestNumber.astype(int).sum())

    # For every date replace its value with national total
    for i in range(0, len(numpyDF)):
        numpyDF[i][1] = totalArray[i]

    totalCasesSum = totalArray[-1]
    newCasesTotalSum = np.sum(newCasesTotal)
    icuTotalsSum = np.sum(icuTotals)

    # Get testing data
    cum_pos_tests, cum_neg_test, cum_test, df_daily_tests, df_daily_pos =  get_test_data(path_dict, root_path)

    totals['cases'] = [totalCasesSum]
    totals['daily'] = [newCasesTotalSum]
    totals['icu'] = [icuTotalsSum]
    totals['cum_pos_test'] = cum_pos_tests
    totals['cum_neg_test'] = cum_neg_test
    totals['cum_test'] = cum_test

    # Convert numpy arrays to panda's dataframes
    df_totals = pd.DataFrame(totals, columns = ['cases', 'daily', 'icu', 'cum_pos_test', 'cum_neg_test', 'cum_test'])
    df_daily_totals = pd.DataFrame(numpyDF, columns = ['date', 'value'])

    current_dir = os.getcwd()

    # Save dataframes
    df_daily_totals.to_csv(current_dir + root_path + "daily_nat_totals.csv")
    df_daily_pos.to_csv(current_dir + root_path + "daily_pos.csv")
    df_daily_tests.to_csv(current_dir + root_path + "daily_tests.csv")
    df_totals.to_json(current_dir + root_path + "totals.json")


# Gets all the test data for Scotland
def get_test_data(path_dict, root_path):
    df = pd.read_csv(path_test)

    df = df[['Date', "Testing - Cumulative people tested for COVID-19 - Negative", "Testing - Cumulative people tested for COVID-19 - Positive", "Testing - Cumulative people tested for COVID-19 - Total", "Testing - Daily people found positive"]]
    df = df.rename(columns={'Date':'date', "Testing - Cumulative people tested for COVID-19 - Negative":'cum_neg_test', "Testing - Cumulative people tested for COVID-19 - Positive":'cum_pos_test', "Testing - Cumulative people tested for COVID-19 - Total":"cum_test", "Testing - Daily people found positive":"daily_pos_test"})

    # Take the final value for the cumulative tests
    cum_pos_tests = df['cum_pos_test'].tail(1).astype(str).astype(int).sum()
    cum_neg_test = df['cum_neg_test'].tail(1).astype(str).astype(int).sum()
    cum_test = df['cum_test'].tail(1).astype(str).astype(int).sum()

    # return dataframe with just date and daily_pos_test fields
    df_daily = df[['date', "cum_neg_test", "cum_pos_test"]]

    df = df[['date', 'daily_pos_test']]
    df['daily_pos_test'] = df['daily_pos_test'].astype(object)
    df = df.rename(columns={'daily_pos_test':'value'})

    df_daily['cum_neg_test'] = df_daily['cum_neg_test'].astype(object)
    df_daily['cum_pos_test'] = df_daily['cum_pos_test'].astype(object)

    df_daily = df_daily.drop(['date'], axis=1)

    print (df)

    return cum_pos_tests, cum_neg_test, cum_test, df_daily, df



def get_all_hbo_data_dict(hbo_list, path_dict, root_path):

    for i in range (1, len(hbo_dict)+1):
        for data_type in path_dict.keys():

            # Create the dataframe
            df = get_hbo_data_by_date(hbo_dict[i], data_type)
            path = root_path + f"{i}_{data_type}.csv"
            current_dir = os.getcwd()
            curr = os.path.dirname(os.getcwd())

            df.to_csv(current_dir + path)


if __name__ == "__main__":

    df_icu = pd.read_csv("https://raw.githubusercontent.com/DataScienceScotland/COVID-19-Management-Information/master/COVID19%20-%20Daily%20Management%20Information%20-%20Scottish%20Health%20Boards%20-%20ICU%20patients.csv")

    hbo_list = list(df_icu.columns.values)
    root_path = "/data/hbo/"

    get_all_hbo_data(path_dict, root_path)
    get_total_hbo_cases(path_dict, root_path)
