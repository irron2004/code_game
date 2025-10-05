
# 학습 지표(로컬 로깅)

## 이벤트(콘솔/로컬)
- `level_loaded` {cols, rows}
- `level_saved` {size, timestamp}
- `algo_run` {algo, allowDiagonal, useWeights}
- `no_path_detected` {blockedCells}
- `rule_toggle` {rule, value}

## KPI(수동 측정/파일럿)
- 세션당 규칙 변경 횟수
- 알고리즘 전환 후 재실행 비율
- 경로 없음 → 해결까지 시도 횟수
