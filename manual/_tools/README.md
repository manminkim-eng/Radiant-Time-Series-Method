# RTS-MANMIN 매뉴얼 도구 (manual/_tools)

2026-11-08 처음 만듦(작업지시서 §25-6 「35종 인쇄 원본과 매뉴얼 갱신」). 그전에는 매뉴얼을 만든 스크립트가 저장소에 없었습니다.

| 파일 | 하는 일 |
|---|---|
| `capture_rts.js` | 예제 `manual/sample/manual_example_6rooms.rts` 를 넣고 `calcAll()` 한 뒤 그림 28장을 찍음(1440×900 · DSF 1.25, 휴대전화 2장은 390×844 · DSF 2). 번호 배지 좌표는 `_marks.json` |
| `gen_manual_rts.py` | 배포된 `manual/index.html` 본문을 정본으로 두고 **그림 부분만** 다시 씀(그림 크기 · 배지 위치). `MANUAL_VER` 를 주면 판 표기 · PDF 이름 · 꼬리말 · 「대상 프로그램」 줄만 그 판으로. 변경 이력 · 기능 설명 속 옛 판 번호는 그대로 |
| `pdf_rts.js` | A4 PDF(EPI `pdf_epi.js` 와 같음 — 꼬리말 제목 · 쪽 번호) |
| `audit_responsive.js` | 좁은 화면(360 ~ 1024) 쪽 넘침 · 표 가로 스크롤 점검(EPI 와 같은 파일) |
| `serve.js` | 저장소를 127.0.0.1 로 띄움. 외부 CDN 은 실제 주소 그대로 통과(vendor 대체 없음) |
| `build.sh` | 위 순서 전체: `bash build.sh <저장소> <임시폴더> [Ver-x.y.z] [YYYY-MM-DD]` |

- 배지 개수가 본문 범례 개수와 다르거나, 본문 그림과 캡처 그림이 1:1 로 맞지 않으면 `gen_manual_rts.py` 가 멈춥니다(AssertionError) — 화면이 바뀌면 `capture_rts.js` 의 `SHOTS` 선택자를 고칩니다.
- 판을 바꾸면 새 이름 PDF 가 생기고 옛 PDF 는 그대로 남습니다 — 옛 PDF 는 지우지 말고 `_삭제대기` 로 옮기고 이동내역을 남깁니다.
- 본문 글을 고칠 때는 `index.html` 을 직접 고칩니다(이 도구는 글을 만들지 않음).
