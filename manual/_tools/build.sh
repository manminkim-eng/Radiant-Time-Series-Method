#!/bin/bash
# RTS-MANMIN 매뉴얼 그림 전체 갱신: 캡처 → WebP → 그림 갱신(gen) → PDF → 좁은 화면 점검   usage: bash build.sh <repoDir> <rawDir> [Ver-x.y.z] [YYYY-MM-DD]
#   판 · 날짜는 환경변수 MANUAL_VER · MANUAL_DATE 로도 줄 수 있음
#   판을 주면 매뉴얼 판 표기 · PDF 이름을 그 판으로(gen_manual_rts.py 참고). 구 PDF 는 지우지 않으니 따로 정리.
set -e; REPO="$(cd "$1" && pwd)"; RAW="$2"; mkdir -p "$RAW"; RAW="$(cd "$RAW" && pwd)"; cd "$(dirname "$0")"; M="$REPO/manual"; mkdir -p "$M/images"
node capture_rts.js "$REPO" "$RAW" > "$RAW/_log.json"
python3 - "$RAW" "$M" <<'PY'
import sys,glob,os,shutil
from PIL import Image
raw,M=sys.argv[1],sys.argv[2]
for f in sorted(glob.glob(raw+'/s*.png')):
    Image.open(f).convert('RGB').save(M+'/images/'+os.path.basename(f)[:-4]+'.webp',quality=82,method=6)
shutil.copy(raw+'/_marks.json',M+'/images/_marks.json')
PY
MANUAL_DIR="$M" MANUAL_VER="${3:-${MANUAL_VER:-}}" MANUAL_DATE="${4:-${MANUAL_DATE:-}}" python3 gen_manual_rts.py
V=$(python3 -c "import re,sys;print(re.search(r'<span class=\"mh-ver\">(Ver-[\d.]+)</span>',open(sys.argv[1],encoding='utf-8').read()).group(1))" "$M/index.html")
node pdf_rts.js "$M" "RTS-MANMIN_사용자매뉴얼_$V.pdf" "RTS-MANMIN 사용자 매뉴얼 $V"
node audit_responsive.js "$M/index.html" > "$RAW/_audit.json"
