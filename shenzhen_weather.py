#!/usr/bin/env python3
"""抓取深圳实时天气信息。"""

import json
import sys
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError


WTTR_URL = "https://wttr.in/Shenzhen?format=j1&lang=zh-cn"
TIMEOUT = 10


def fetch_weather(url: str = WTTR_URL) -> dict:
    req = Request(url, headers={"User-Agent": "curl/8.0"})
    with urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def format_weather(data: dict) -> str:
    current = data["current_condition"][0]
    area = data["nearest_area"][0]

    city = area["areaName"][0]["value"]
    region = area["region"][0]["value"]
    country = area["country"][0]["value"]

    desc_list = current.get("lang_zh-cn") or current.get("weatherDesc") or []
    description = desc_list[0]["value"] if desc_list else "未知"

    observation_time = current.get("localObsDateTime", "未知")

    lines = [
        f"城市: {city}, {region}, {country}",
        f"观测时间: {observation_time}",
        f"天气: {description}",
        f"温度: {current['temp_C']}°C (体感 {current['FeelsLikeC']}°C)",
        f"湿度: {current['humidity']}%",
        f"风向风速: {current['winddir16Point']} {current['windspeedKmph']} km/h",
        f"气压: {current['pressure']} hPa",
        f"能见度: {current['visibility']} km",
        f"云量: {current['cloudcover']}%",
        f"紫外线指数: {current['uvIndex']}",
    ]
    return "\n".join(lines)


def main() -> int:
    try:
        data = fetch_weather()
    except (URLError, HTTPError) as exc:
        print(f"网络请求失败: {exc}", file=sys.stderr)
        return 1
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        print(f"解析天气数据失败: {exc}", file=sys.stderr)
        return 1

    print(f"=== 深圳实时天气 (抓取时间 {datetime.now():%Y-%m-%d %H:%M:%S}) ===")
    print(format_weather(data))
    return 0


if __name__ == "__main__":
    sys.exit(main())
