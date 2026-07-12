# 텍스트 배치 개선 결과

## 결과
- 대상: Card 18개 라우트, 브라우저 85개 상태.
- 최종 판정: page overflow, 값·단위/컨트롤 줄바꿈, 텍스트 overflow, 고아줄, 슬라이더 오류 모두 0건.
- `npm run typecheck` → `npm test` → `npm run build` 통과, 27개 테스트 통과.

## 적용 내용
- 결과 지표·정렬·연료/마일리지 선택 Grid를 좁은 화면에서 한 열로 재배치했습니다.
- 제목과 기준 배지가 폭을 경쟁하지 않도록 모바일 titlebar 제목에 전체 행을 부여했습니다.
- 비교 표는 내용 너비를 보존한 내부 스크롤로 처리하고 금액·비율은 한 의미 단위로 유지했습니다.

## 관련 코드
- [responsive-accessibility.css](../../client/src/assets/css/responsive-accessibility.css)
- [DutyFreeResult.vue](../../client/src/components/duty-free/DutyFreeResult.vue)
- [AnnualFeeResultCard.vue](../../client/src/components/annual-fee/AnnualFeeResultCard.vue)
- [OverseasCompareTable.vue](../../client/src/components/overseas/OverseasCompareTable.vue)
- [PointConvertView.vue](../../client/src/views/PointConvertView.vue)

근거: `../../../artifacts/text-layout-audit/final-consolidated-summary.json`. 열린 이슈는 [issues.json](./issues.json)입니다.
