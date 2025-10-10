
# 레벨 제작 가이드

## 셀 코드
- 0 EMPTY, 1 WALL, 2 START, 3 GOAL, 4 FOREST(2), 5 SAND(3)

## JSON 스키마 (v1)
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

### 필수 검증 항목

- `cells.length === cols * rows`
- `start`, `goal` 좌표가 0 ≤ x < cols, 0 ≤ y < rows
- `cells` 값은 0~5 정수만 허용
- `version`은 현재 1 (이후 확장 대비)
- `start`와 `goal`이 동일하면 로더가 경고를 띄웁니다.

불러오기에 실패하면 다음 메시지가 노출됩니다.

- `cells 길이가 cols*rows와 다름` ▶ “레벨 파일이 손상되었어요. 크기와 칸 수가 맞는지 확인해 주세요.”
- `start/goal 범위 벗어남` ▶ “시작/목표가 격자 밖에 있어요. 좌표를 고쳐주세요.”
- JSON 파싱 오류 ▶ “JSON 파싱 오류: …”

## 팁

* 시작/목표는 경계에서 1칸 띄우기 권장
* BFS 체감: 균일 비용 + 직교만
* Dijkstra 체감: 숲/모래 띠 만들기
* A* 체감: 대각 허용 + 미로

## 학습 레벨 샘플 요약

| ID | 설명 | 규칙 | 특징 |
| --- | --- | --- | --- |
| tutorial-1 | 직선 길 열기 | BFS / 대각선 OFF / 가중치 OFF | “재생”만으로 최단 경로 체험 |
| tutorial-2 | 숲/모래 가중치 | Dijkstra / 가중치 ON | BFS vs Dijkstra 비교 토글 |
| tutorial-3 | 대각선 + A* | A* / 대각선 ON / 가중치 OFF | 사선 장애물 우회, 휴리스틱 체감 |

각 튜토리얼 JSON은 `src/tutorial.js`에서 확인할 수 있으며, 작성 시 위 표를 참고해 동일한 규칙/교훈을 갖도록 설계합니다.
