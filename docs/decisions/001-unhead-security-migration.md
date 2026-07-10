# ADR-001: Unhead 보안 마이그레이션

- 상태: Accepted
- 기준일: 2026-07-11

## 배경

`@vueuse/head`가 취약한 구버전 `@unhead/vue`와 `unhead`를 고정해 `npm audit`에서 URI scheme sanitization 관련 취약점 3건이 검출됐다. 카드 도구의 canonical, OG, JSON-LD를 유지하려면 head manager가 필요하다.

## 결정

공식 후속 패키지 `@unhead/vue`로 직접 전환한다. Vue client entry에서 `createHead`를 가져오고 composable은 `useHead` API를 유지한다. 실제 버전은 lockfile로 고정한다.

## 결과

- 취약한 호환 패키지 체인을 제거한다.
- 기존 SEO 출력 계약을 유지한다.
- typecheck, test, prerender/static 검증, font 검증, `npm audit`를 회귀 gate로 사용한다.

## 롤백

문제가 생기면 이 커밋을 되돌려 이전 lockfile과 import를 복원한다.
