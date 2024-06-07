import pandas as pd

data = pd.read_csv("lib/taxonomy_entry.csv")
entry_list = data["ENTRY"].to_list()
