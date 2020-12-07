import requests
import json

kanjiDataString = requests.get('https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json').content

kanjiData = json.loads(kanjiDataString)

jlptKanji = {
    "N5": {},
    "N4": {},
    "N3": {},
    "N2": {},
    "N1": {},
}

for character, info in kanjiData.items():
    if info["jlpt_new"]:
        category = f"N{info['jlpt_new']}"
        
        jlptKanji[category][character] = {
            "meanings": info["meanings"],
            "onyomiReadings": info["readings_on"],
            "kunyomiReadings": info["readings_kun"]
        }

json.dump(jlptKanji, open("JLPT.json", "x"), ensure_ascii=False)
