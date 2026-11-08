# -*- coding: utf-8 -*-
"""RTS-MANMIN 사용자 매뉴얼 그림 갱신기 — 실행: MANUAL_DIR=<manual 폴더> [MANUAL_VER=Ver-5.3.14] [MANUAL_DATE=2026-11-08] python gen_manual_rts.py
   RTS 매뉴얼은 처음 만든 생성 원본(gen)이 저장소에 없다. 그래서 배포된 manual/index.html 본문을 정본으로 두고,
   capture_rts.js 가 만든 images/_marks.json 으로 그림 부분만 다시 쓴다(다른 도구 manual_engine.fig() 와 같은 배지 좌표식).
     · <figure class="shot" id="fig-ID"> 의 img width/height, 번호 배지(pin) 위치를 새 캡처값으로
     · 범례(legend) 글은 그대로 — 배지 개수가 범례와 다르면 멈춘다(AssertionError)
     · MANUAL_VER 를 주면 판 표기(title · 설명 · 머리 판 · PDF 이름 · 「대상 프로그램」 줄)만 그 판으로 — 변경 이력 · 기능 설명 속 옛 판 번호는 그대로
   본문 글 · 표 · 색은 손대지 않는다."""
import os, re, json, sys
B = os.environ.get('MANUAL_DIR') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
IDX = os.path.join(B, 'index.html')
MARKS = json.load(open(os.path.join(B, 'images', '_marks.json'), encoding='utf-8'))
s = open(IDX, encoding='utf-8', newline='').read(); s0 = s

def pin(k):   # manual_engine.fig() 와 같은 식
    x = min(97.0, max(1.5, k['x'] + 0.4))
    y = min(96.0, max(2.0, k['y'] + (0.8 if k['h'] < 15 else min(k['h'], 6) / 2)))
    return f'<span class="pin" style="left:{x:.2f}%;top:{y:.2f}%">{k["n"]}</span>'

done, miss = [], []
def fig(m):
    cls, sid, body = m.group(1), m.group(2), m.group(3)
    if sid not in MARKS: miss.append(sid); return m.group(0)
    M = MARKS[sid]
    legend = re.findall(r'<li><b>(\d+)</b>', body)
    pins = [pin(k) for k in M['marks'] if 'x' in k]
    lost = [k['label'] for k in M['marks'] if 'x' not in k]
    assert not lost, f'{sid} 배지 위치 못 찾음: {lost}'
    assert len(pins) == len(legend), f'{sid} 배지 {len(pins)}개 ≠ 범례 {len(legend)}개'
    body = re.sub(r'(<img src="images/' + re.escape(sid) + r'\.webp") width="\d+" height="\d+"', rf'\1 width="{M["w"]}" height="{M["h"]}"', body, count=1)
    body = re.sub(r'<span class="pin" style="[^"]*">\d+</span>', '', body)
    body = body.replace('</div><figcaption>', ''.join(pins) + '</div><figcaption>', 1)
    done.append(sid)
    return f'<figure class="{cls}" id="fig-{sid}">{body}</figure>'
s = re.sub(r'<figure class="(shot[^"]*)" id="fig-([^"]+)">(.*?)</figure>', fig, s, flags=re.S)
unused = sorted(set(MARKS) - set(done))
assert not miss and not unused, f'그림 대응 안 됨 — 본문에만 {miss} · 캡처에만 {unused}'

VER = os.environ.get('MANUAL_VER'); DATE = os.environ.get('MANUAL_DATE')
if VER:
    old = re.search(r'<span class="mh-ver">(Ver-[\d.]+)</span>', s).group(1)
    if old != VER:
        rep = [(f'<title>RTS-MANMIN 사용자 매뉴얼 {old}</title>', f'<title>RTS-MANMIN 사용자 매뉴얼 {VER}</title>'),
               (f'content="RTS-MANMIN {old} ', f'content="RTS-MANMIN {VER} '),
               (f'<span class="mh-ver">{old}</span>', f'<span class="mh-ver">{VER}</span>'),
               (f'RTS-MANMIN_사용자매뉴얼_{old}.pdf', f'RTS-MANMIN_사용자매뉴얼_{VER}.pdf')]
        for a, b in rep:
            assert s.count(a) >= 1, a; s = s.replace(a, b)
        m = re.search(r'(<div class="pfoot"><span>RTS-MANMIN 사용자 매뉴얼 )' + re.escape(old) + r'(</span><span>)[\d-]+(</span>)', s)
        assert m, 'pfoot'
        s = s[:m.start()] + m.group(1) + VER + m.group(2) + (DATE or '') + m.group(3) + s[m.end():]
        m = re.search(r'(<td class="">대상 프로그램</td><td class="">RTS-MANMIN <b>)' + re.escape(old) + r'(</b> \()[\d-]+( 배포\))', s)
        assert m, '대상 프로그램 줄'
        s = s[:m.start()] + m.group(1) + VER + m.group(2) + (DATE or '') + m.group(3) + s[m.end():]
if s != s0: open(IDX, 'w', encoding='utf-8', newline='').write(s)
print(json.dumps({'figures': len(done), 'ver': VER, 'changed': s != s0}, ensure_ascii=False))
