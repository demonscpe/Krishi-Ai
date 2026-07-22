"""Crop price prediction engine (port of the Flask version)."""
import random
import numpy as np
import pandas as pd
from datetime import datetime
from math import ceil
from sklearn.tree import DecisionTreeRegressor
from config import CROP_DATA_DIR

COMMODITY_DICT = {
    "arhar": "Arhar.csv", "bajra": "Bajra.csv", "barley": "Barley.csv",
    "copra": "Copra.csv", "cotton": "Cotton.csv", "sesamum": "Sesamum.csv",
    "gram": "Gram.csv", "groundnut": "Groundnut.csv", "jowar": "Jowar.csv",
    "maize": "Maize.csv", "masoor": "Masoor.csv", "moong": "Moong.csv",
    "niger": "Niger.csv", "paddy": "Paddy.csv", "ragi": "Ragi.csv",
    "rape": "Rape.csv", "jute": "Jute.csv", "safflower": "Safflower.csv",
    "soyabean": "Soyabean.csv", "sugarcane": "Sugarcane.csv",
    "sunflower": "Sunflower.csv", "urad": "Urad.csv", "wheat": "Wheat.csv"
}

ANNUAL_RAINFALL = [29, 21, 37.5, 30.7, 52.6, 150, 299, 251.7, 179.2, 70.5, 39.8, 10.9]

BASE = {
    "Paddy": 1245.5, "Arhar": 3200, "Bajra": 1175, "Barley": 980,
    "Copra": 5100, "Cotton": 3600, "Sesamum": 4200, "Gram": 2800,
    "Groundnut": 3700, "Jowar": 1520, "Maize": 1175, "Masoor": 2800,
    "Moong": 3500, "Niger": 3500, "Ragi": 1500, "Rape": 2500,
    "Jute": 1675, "Safflower": 2500, "Soyabean": 2200, "Sugarcane": 2250,
    "Sunflower": 3700, "Urad": 4300, "Wheat": 1350
}

CROP_DATA = {
    "wheat": ["../assets/crops/wheat.png", "U.P., Punjab, Haryana, Rajasthan, M.P., bihar", "rabi", "Sri Lanka, United Arab Emirates, Taiwan"],
    "paddy": ["../assets/crops/paddy.png", "W.B., U.P., Andhra Pradesh, Punjab, T.N.", "kharif", "Bangladesh, Saudi Arabia, Iran"],
    "barley": ["../assets/crops/barley.png", "Rajasthan, Uttar Pradesh, Madhya Pradesh, Haryana, Punjab", "rabi", "Oman, UK, Qatar, USA"],
    "maize": ["../assets/crops/maize.png", "Karnataka, Andhra Pradesh, Tamil Nadu, Rajasthan, Maharashtra", "kharif", "Hong Kong, United Arab Emirates, France"],
    "bajra": ["../assets/crops/bajra.png", "Rajasthan, Maharashtra, Haryana, Uttar Pradesh and Gujarat", "kharif", "Oman, Saudi Arabia, Israel, Japan"],
    "copra": ["../assets/crops/copra.png", "Kerala, Tamil Nadu, Karnataka, Andhra Pradesh, Orissa, West Bengal", "rabi", "Veitnam, Bangladesh, Iran, Malaysia"],
    "cotton": ["../assets/crops/cotton.png", "Punjab, Haryana, Maharashtra, Tamil Nadu, Madhya Pradesh, Gujarat", "kharif", "China, Bangladesh, Egypt"],
    "masoor": ["../assets/crops/masoor.png", "Uttar Pradesh, Madhya Pradesh, Bihar, West Bengal, Rajasthan", "rabi", "Pakistan, Cyprus,United Arab Emirates"],
    "gram": ["../assets/crops/gram.png", "Madhya Pradesh, Maharashtra, Rajasthan, Uttar Pradesh, Andhra Pradesh & Karnataka", "rabi", "Veitnam, Spain, Myanmar"],
    "groundnut": ["../assets/crops/groundnut.png", "Andhra Pradesh, Gujarat, Tamil Nadu, Karnataka, and Maharashtra", "kharif", "Indonesia, Jordan, Iraq"],
    "arhar": ["../assets/crops/arhar.png", "Maharashtra, Karnataka, Madhya Pradesh and Andhra Pradesh", "kharif", "United Arab Emirates, USA, Chicago"],
    "sesamum": ["../assets/crops/sesamum.png", "Maharashtra, Rajasthan, West Bengal, Andhra Pradesh, Gujarat", "rabi", "Iraq, South Africa, USA, Netherlands"],
    "jowar": ["../assets/crops/jowar.png", "Maharashtra, Karnataka, Andhra Pradesh, Madhya Pradesh, Gujarat", "kharif", "Torronto, Sydney, New York"],
    "moong": ["../assets/crops/moong.png", "Rajasthan, Maharashtra, Andhra Pradesh", "rabi", "Qatar, United States, Canada"],
    "niger": ["../assets/crops/niger.png", "Andha Pradesh, Assam, Chattisgarh, Gujarat, Jharkhand", "kharif", "United States of American,Argenyina, Belgium"],
    "rape": ["../assets/crops/rape.png", "Rajasthan, Uttar Pradesh, Haryana, Madhya Pradesh, and Gujarat", "rabi", "Veitnam, Malaysia, Taiwan"],
    "jute": ["../assets/crops/jute.png", " West Bengal , Assam , Orissa , Bihar , Uttar Pradesh", "kharif", "JOrdan, United Arab Emirates, Taiwan"],
    "safflower": ["../assets/crops/safflower.png", "Maharashtra, Karnataka, Andhra Pradesh, Madhya Pradesh, Orissa", "kharif", "Philippines, Taiwan, Portugal"],
    "soyabean": ["../assets/crops/soyabean.png", "Madhya Pradesh, Maharashtra, Rajasthan, Madhya Pradesh and Maharashtra", "kharif", "Spain, Thailand, Singapore"],
    "urad": ["../assets/crops/urad.png", "Andhra Pradesh, Maharashtra, Madhya Pradesh, Tamil Nadu", "rabi", "United States, Canada, United Arab Emirates"],
    "ragi": ["../assets/crops/ragi.png", "Maharashtra, Tamil Nadu and Uttarakhand", "kharif", "United Arab Emirates, New Zealand, Bahrain"],
    "sunflower": ["../assets/crops/sunflower.png", "Karnataka, Andhra Pradesh, Maharashtra, Bihar, Orissa", "rabi", "Phillippines, United States, Bangladesh"],
    "sugarcane": ["../assets/crops/sugarcane.png", "Uttar Pradesh, Maharashtra, Tamil Nadu, Karnataka, Andhra Pradesh", "kharif", "Kenya, United Arab Emirates, United Kingdom"]
}


class CommodityModel:
    """Wrapper around a DecisionTreeRegressor for a single commodity."""

    def __init__(self, csv_name: str):
        csv_path = CROP_DATA_DIR / csv_name
        dataset = pd.read_csv(csv_path)
        self.name = csv_name
        self.X = dataset.iloc[:, :-1].values
        self.Y = dataset.iloc[:, 3].values
        depth = random.randrange(7, 18)
        self.regressor = DecisionTreeRegressor(max_depth=depth)
        self.regressor.fit(self.X, self.Y)

    def getPredictedValue(self, value):
        if value[1] >= 2019:
            return self.regressor.predict(np.array(value).reshape(1, 3))[0]
        else:
            x = [i.tolist() for i in self.X[:, 0:2]]
            fsa = [value[0], value[1]]
            for i in range(len(x)):
                if x[i] == fsa:
                    return self.Y[i]
            return 0

    def getCropName(self):
        return self.name.split('.')[0]


def _build_commodity_list():
    """Build list of CommodityModel instances."""
    return [CommodityModel(COMMODITY_DICT[key]) for key in COMMODITY_DICT]


COMMODITY_LIST = _build_commodity_list()


def _top_five(commodity_list, reverse=True):
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    current_rainfall = ANNUAL_RAINFALL[current_month - 1]
    prev_month = current_month - 1
    prev_rainfall = ANNUAL_RAINFALL[prev_month - 1]

    current_preds = []
    prev_preds = []
    for c in commodity_list:
        current_preds.append(c.getPredictedValue([float(current_month), current_year, current_rainfall]))
        prev_preds.append(c.getPredictedValue([float(prev_month), current_year, prev_rainfall]))

    change = [(((current_preds[i] - prev_preds[i]) * 100 / prev_preds[i]), i) for i in range(len(commodity_list))]
    change.sort(reverse=reverse)

    results = []
    for j in range(min(5, len(change))):
        perc, i = change[j]
        name = commodity_list[i].getCropName()
        price = (current_preds[i] * BASE.get(name, 1000)) / 100
        results.append([name, round(price, 2), round(perc, 2)])
    return results


def _six_months_forecast(commodity_list):
    month_data = [[] for _ in range(6)]
    now = datetime.now()
    current_month = now.month
    current_year = now.year

    for c in commodity_list:
        forecast = _forecast_helper(c, current_month, current_year)
        for k, f in enumerate(forecast):
            if k < 6:
                month_data[k].append((f[1], f[2], c.getCropName(), f[0]))

    crop_month_wise = []
    for md in month_data:
        md.sort()
        if md:
            crop_month_wise.append([md[0][3], md[-1][2], md[-1][1], md[-1][0], md[0][2], md[0][1], md[0][0]])
    return crop_month_wise


def _forecast_helper(commodity, current_month, current_year):
    current_rainfall = ANNUAL_RAINFALL[current_month - 1]
    month_with_year = []
    for i in range(1, 13):
        m = current_month + i
        y = current_year
        if m > 12:
            m -= 12
            y += 1
        month_with_year.append((m, y, ANNUAL_RAINFALL[m - 1]))

    current_wpi = commodity.getPredictedValue([float(current_month), current_year, current_rainfall])
    crop_price = []
    for m, y, r in month_with_year[:12]:
        wpis = commodity.getPredictedValue([float(m), y, r])
        change = ((wpis - current_wpi) * 100) / current_wpi
        x = datetime(y, m, 1).strftime("%b %y")
        crop_price.append([x, round((wpis * BASE.get(commodity.getCropName(), 1000)) / 100, 2), round(change, 2)])
    return crop_price


async def get_price_overview() -> dict:
    """Get price overview: top gainers, top losers, 6-month forecast."""
    top_gainers = _top_five(COMMODITY_LIST, reverse=True)
    top_losers = _top_five(COMMODITY_LIST, reverse=False)
    six_months = _six_months_forecast(COMMODITY_LIST)

    commodities = list(COMMODITY_DICT.keys())
    num_per_row = 8
    chunks = [commodities[i:i + num_per_row] for i in range(0, len(commodities), num_per_row)]

    return {
        "top_gainers": top_gainers,
        "top_losers": top_losers,
        "six_months_forecast": six_months,
        "commodities": commodities,
        "chunks": chunks
    }


async def get_commodity_detail(crop_name: str) -> dict:
    """Get detailed forecast for a single commodity."""
    name = crop_name.lower()

    # Find the commodity
    commodity = None
    for c in COMMODITY_LIST:
        if name == str(c).lower():
            commodity = c
            break
    # Fallback to first commodity
    if commodity is None:
        commodity = COMMODITY_LIST[0]

    now = datetime.now()
    current_month = now.month
    current_year = now.year

    forecast = _forecast_helper(commodity, current_month, current_year)
    current_price = commodity.getPredictedValue([float(current_month), current_year, ANNUAL_RAINFALL[current_month - 1]])
    current_price = (current_price * BASE.get(name.capitalize(), 1000)) / 100

    # Find max/min in forecast
    max_val = max(forecast, key=lambda x: x[1])
    min_val = min(forecast, key=lambda x: x[1])

    # Previous 12 months
    prev_crop = []
    for i in range(1, 13):
        m = current_month - i
        y = current_year
        if m < 1:
            m += 12
            y -= 1
        val = commodity.getPredictedValue([float(m), max(2013, y), ANNUAL_RAINFALL[m - 1]])
        x = datetime(y, m, 1).strftime("%b %y")
        prev_crop.append([x, round((val * BASE.get(name.capitalize(), 1000)) / 100, 2)])
    prev_crop.reverse()

    crop_info = CROP_DATA.get(name, ["", "", "", ""])

    return {
        "name": name,
        "max_crop": max_val,
        "min_crop": min_val,
        "forecast_values": forecast,
        "forecast_x": [f[0] for f in forecast],
        "forecast_y": [f[1] for f in forecast],
        "previous_values": prev_crop,
        "previous_x": [p[0] for p in prev_crop],
        "previous_y": [p[1] for p in prev_crop],
        "current_price": round(current_price, 2),
        "image_url": crop_info[0],
        "prime_loc": crop_info[1],
        "type_c": crop_info[2],
        "export": crop_info[3]
    }

