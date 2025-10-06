
# 레벨 제작 가이드

## 셀 코드
- 0 EMPTY, 1 WALL, 2 START, 3 GOAL, 4 FOREST(2), 5 SAND(3)

## JSON 스키마(초안)
```json
{
  "version": 1,
  "cols": 10,
  "rows": 8,
  "start": {"x":1,"y":1},
  "goal": {"x":8,"y":6},
  "cells": [ /* 길이 = cols*rows, 값은 0/1/2/3/4/5 */ ]
}
```

## 팁

* 시작/목표는 경계에서 1칸 띄우기 권장
* BFS 체감: 균일 비용 + 직교만
* Dijkstra 체감: 숲/모래 띠 만들기
* A* 체감: 대각 허용 + 미로

## 검증 체크

* `cols*rows === cells.length`
* 좌표 범위 유효
* 시작·목표 중복 금지(로더가 보정하나 지양)
