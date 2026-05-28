import pandas as pd
import json

happiness_df     = pd.read_csv("happiness.csv")
steps_df         = pd.read_csv("world_map_steps_average.csv")
wine_df          = pd.read_csv("wine-consumption-per-capita.csv")
diet_df          = pd.read_csv("world_diets.csv")
life_expectancy_df = pd.read_csv("life-expectancy.csv")

happiness_df = happiness_df.rename(columns={
    "Life evaluation (3-year average)": "Life evaluation",
    "Country name": "country"
})
steps_df = steps_df.rename(columns={"region": "country"})
wine_df = wine_df.rename(columns={
    "Alcohol, recorded per capita (15+) consumption (in litres of pure alcohol) - Beverage types: Wine": "Wine Consumption",
    "Code": "ISO",
    "Entity": "country"
})
diet_df            = diet_df.rename(columns={"Entity": "country", "Code": "ISO"})
life_expectancy_df = life_expectancy_df.rename(columns={"Entity": "country", "Code": "ISO"})

# Full range: wine/diet/LE have data from the 1960s; happiness starts 2011
# and is backward-filled for earlier years (keeping value equal when not available)
YEARS = list(range(1965, 2025))

h_y    = happiness_df[happiness_df["Year"].isin(YEARS)][["Year", "country", "Life evaluation"]].copy()
le_y   = life_expectancy_df[life_expectancy_df["Year"].isin(YEARS)][["Year", "country", "ISO", "Life expectancy"]].copy()
diet_y = diet_df[diet_df["Year"].isin(YEARS)][["Year", "country", "ISO", "plant_based_ratio", "Pulses"]].copy()
wine_y = wine_df[wine_df["Year"].isin(YEARS)][["Year", "country", "ISO", "Wine Consumption"]].copy()

# Base: LE countries × all years (most complete country list with ISO codes)
all_countries = le_y[["country", "ISO"]].drop_duplicates()
base = (
    pd.MultiIndex.from_product([all_countries["country"].tolist(), YEARS], names=["country", "Year"])
    .to_frame(index=False)
    .merge(all_countries, on="country", how="left")
)

merged = (
    base
    .merge(le_y[["Year", "ISO", "Life expectancy"]],             on=["Year", "ISO"],     how="left")
    .merge(diet_y[["Year", "ISO", "plant_based_ratio", "Pulses"]], on=["Year", "ISO"],   how="left")
    .merge(wine_y[["Year", "ISO", "Wine Consumption"]],           on=["Year", "ISO"],     how="left")
    .merge(steps_df[["country", "steps_mean_filtered"]],          on="country",           how="left")
    .merge(h_y[["Year", "country", "Life evaluation"]],           on=["Year", "country"], how="left")
)

# Fill gaps within each country: forward-fill then backward-fill
# so any missing year uses the nearest available value in either direction
merged = merged.sort_values(["country", "Year"])
for col in ["Life expectancy", "plant_based_ratio", "Pulses", "Wine Consumption", "Life evaluation"]:
    merged[col] = merged.groupby("country")[col].ffill()
    merged[col] = merged.groupby("country")[col].bfill()

# Normalize globally across ALL years so comparisons across years are consistent
max_plant = merged["plant_based_ratio"].max()
max_wine  = merged["Wine Consumption"].max()
max_steps = merged["steps_mean_filtered"].max()
max_happy = merged["Life evaluation"].max()

merged["plant_based_ratio"]   = merged["plant_based_ratio"]   / max_plant
merged["Wine Consumption"]    = merged["Wine Consumption"]    / max_wine
merged["steps_mean_filtered"] = merged["steps_mean_filtered"] / max_steps
merged["Life evaluation"]     = merged["Life evaluation"]     / max_happy
merged["blue_zone_index"] = (
    merged["Life evaluation"] +
    merged["steps_mean_filtered"] +
    merged["Wine Consumption"] +
    merged["plant_based_ratio"]
) / 4

merged = merged.fillna(0)

MAP_COLS     = ["blue_zone_index", "Life evaluation", "steps_mean_filtered",
                "Wine Consumption", "plant_based_ratio", "Life expectancy"]
SCATTER_COLS = MAP_COLS + ["Pulses"]

map_out     = {}
scatter_out = {}

for year in YEARS:
    ydf = merged[merged["Year"] == year].copy()
    # Deduplicate by country (take mean for any rare country-ISO duplicates)
    ydf = ydf.groupby("country")[MAP_COLS + ["Pulses"]].mean().reset_index()
    map_out[str(year)]     = ydf.set_index("country")[MAP_COLS].to_dict(orient="index")
    scatter_out[str(year)] = ydf[["country"] + SCATTER_COLS].to_dict(orient="records")

with open("blue-zone-index-by-year.json", "w") as f:
    json.dump(map_out, f)

with open("blue-zone-index-scatter-plot-by-year.json", "w") as f:
    json.dump(scatter_out, f)

print(f"Done. Years: {YEARS[0]}–{YEARS[-1]}, Countries: {len(all_countries)}")
