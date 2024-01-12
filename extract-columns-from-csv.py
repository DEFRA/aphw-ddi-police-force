import json
import csv
def main():
  dict = {
    "postcodes": []
  }
  with open("ONSPD_NOV_2023_UK.csv", 'r') as f:
    reader = csv.reader(f)
    for row in reader:
      dict["postcodes"].append({
        "postcode": row[0].replace(' ', ''),
        "lat": row[42],
        "lon": row[43]
      })
  j = json.dumps(dict, indent=2)
  with open("postcodes.json", 'w') as f:
    print(j, file=f)
if __name__ == "__main__":
  main()
