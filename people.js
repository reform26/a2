/**
 * people.js — 개혁신당 충남도당 인물 데이터 및 모달 관련 스크립트
 *
 * 이 파일에는 다음이 포함됩니다:
 *   - peopleData       : 인물별 이름·직함·약력·사진·SNS 정보
 *   - peopleSnsIcons   : SNS 아이콘 SVG 문자열 맵
 *   - renderPeopleBadges()        : 직함 뱃지 렌더링 (카드·모달 공용)
 *   - renderAllPeopleCardBadges() : 카드 그리드 뱃지 + 약력 첫 줄 렌더링
 *   - openPeopleModal(id)         : 인물 상세 모달 열기
 *   - closePeopleModal()          : 인물 상세 모달 닫기
 */

// ===== 인물 데이터 =====
const peopleData = {
    'lee-eunchang': {
        name: '이은창',
        status: ['도당위원장', '당협위원장', '운영위원'],
        bio: [
            '충청남도당 위원장 직무대행',
            '공주·부여·청양 당협위원장',
            '제6대 유성구의원',
            '제21대 대선 선대위 대변인'
        ],
        photo: 'https://i.imgur.com/yP4ncGr.png',
        sns: {
            fb: 'https://www.facebook.com/profile.php?id=100002081097533',
            ig: 'https://www.instagram.com/eunchang_0100/',
            yt: 'https://www.youtube.com/@%EC%9D%B4%EC%9D%80%EC%B0%BD-l8u'
        }
    },
    'lee-seongjin': {
        name: '이성진',
        status: ['당협위원장', '운영위원'],
        bio: [
            '천안시 병 당협위원장',
            '전) 충청남도당 위원장',
            '전) 개혁신당 홍보부총장',
            '21대 대선 홍보부본부장'
        ],
        photo: 'https://i.imgur.com/g3zvOOa.png',
        sns: {
            yt: 'https://www.youtube.com/@Leeseongjin24',
            fb: 'https://www.facebook.com/positivemoneel',
            ig: 'https://www.instagram.com/leeseong_'
        }
    },
    'go-jaeyun': {
        name: '고재윤',
        status: ['대변인'],
        bio: [
            '충남도당 대변인',
            '대전시당 정책·자문위원',
            '21대 대선 충남 선대본부 위원',
            '자원봉사단체 청춘 대표'
        ],
        photo: 'https://i.imgur.com/Fyk1Di8.png',
        sns: {
            fb: 'https://www.facebook.com/profile.php?id=100075309062913',
            ig: 'https://www.instagram.com/yn._.jae/',
            blog: 'https://m.blog.naver.com/kojy9402?tab=1',
            site: 'https://litt.ly/gojaeyun'
        }
    }
};

// ===== SNS 아이콘 SVG 맵 =====
const peopleSnsIcons = {
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.74.07-.96.04-1.48.2-1.83.34-.46.18-.78.39-1.13.73-.34.35-.55.67-.73 1.13-.14.35-.3.87-.34 1.83C3.17 8.5 3.16 8.85 3.16 12s.01 3.5.07 4.74c.04.96.2 1.48.34 1.83.18.46.39.78.73 1.13.35.34.67.55 1.13.73.35.14.87.3 1.83.34 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.96-.04 1.48-.2 1.83-.34.46-.18.78-.39 1.13-.73.34-.35.55-.67.73-1.13.14-.35.3-.87.34-1.83.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.96-.2-1.48-.34-1.83a3.04 3.04 0 00-.73-1.13 3.04 3.04 0 00-1.13-.73c-.35-.14-.87-.3-1.83-.34C15.5 4.01 15.15 4 12 4zm0 3.05a4.95 4.95 0 110 9.9 4.95 4.95 0 010-9.9zm0 1.8a3.15 3.15 0 100 6.3 3.15 3.15 0 000-6.3zm5.4-3.36a1.16 1.16 0 110 2.32 1.16 1.16 0 010-2.32z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M21.8 8.001s-.2-1.41-.82-2.04c-.78-.82-1.66-.82-2.06-.87C16.05 4.9 12 4.9 12 4.9h-.01s-4.05 0-6.92.19c-.4.05-1.28.05-2.06.87-.62.63-.82 2.04-.82 2.04S2 9.66 2 11.32v1.36c0 1.66.2 3.32.2 3.32s.2 1.41.82 2.04c.78.82 1.8.79 2.26.88 1.64.16 6.72.19 6.72.19s4.05-.01 6.92-.2c.4-.05 1.28-.05 2.06-.87.62-.63.82-2.04.82-2.04s.2-1.66.2-3.32v-1.36c0-1.66-.2-3.32-.2-3.32zM9.96 14.98V8.66l5.6 3.16-5.6 3.16z"/></svg>',
    blog: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm2 3v2h2V7H6zm4 0v2h8V7h-8zM6 11v2h2v-2H6zm4 0v2h8v-2h-8zM6 15v2h2v-2H6zm4 0v2h6v-2h-6z"/></svg>',
    site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5l6-6m0 0h-4m4 0v4M11 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5"/></svg>'
};

// ===== 인물 직함 뱃지 렌더링 (카드/모달 공용) =====
// size: 'sm'(카드) | 'md'(모달)
function renderPeopleBadges(container, statusList, size) {
    if (!container) return;
    container.innerHTML = '';
    const list = Array.isArray(statusList) ? statusList : [statusList];
    const sizeClass = size === 'md'
        ? 'px-2.5 py-1 text-[11px]'
        : 'px-2 py-0.5 text-[10px] shadow-sm';
    list.forEach(label => {
        const span = document.createElement('span');
        span.className = 'inline-block ' + sizeClass + ' font-bold bg-orange-100 text-reform-500 dark:bg-orange-900/30 dark:text-orange-400 rounded-md';
        span.textContent = label;
        container.appendChild(span);
    });
}

// ===== 인물 카드 그리드의 뱃지 + 약력 첫 줄 렌더링 =====
function renderAllPeopleCardBadges() {
    document.querySelectorAll('.people-card-badges').forEach(el => {
        const id = el.getAttribute('data-people-id');
        const data = peopleData[id];
        if (data) renderPeopleBadges(el, data.status, 'sm');
    });
    document.querySelectorAll('.people-card-subtitle').forEach(el => {
        const id = el.getAttribute('data-people-id');
        const data = peopleData[id];
        if (data && Array.isArray(data.bio) && data.bio.length > 0) {
            el.textContent = data.bio[0];
        }
    });
}

// ===== 인물 상세 패널 (전체화면 슬라이드업) =====
let peopleModalLastFocused = null;

function handlePeopleModalKeydown(e) {
    if (e.key === 'Escape') closePeopleModal();
}

// bio 목록을 <ul>에 렌더링하는 헬퍼
function _renderBioList(el, bioArr) {
    if (!el) return;
    el.innerHTML = '';
    bioArr.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = '<span class="mt-[7px] w-1.5 h-1.5 rounded-full bg-reform-500 shrink-0"></span><span></span>';
        li.querySelector('span:last-child').textContent = item;
        el.appendChild(li);
    });
}

// SNS 링크를 컨테이너에 렌더링하는 헬퍼
function _renderSns(el, sns) {
    if (!el) return;
    el.innerHTML = '';
    if (!sns) return;
    Object.keys(sns).forEach(key => {
        if (!peopleSnsIcons[key]) return;
        const a = document.createElement('a');
        a.href = sns[key];
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-reform-500 hover:text-white transition-colors';
        a.innerHTML = peopleSnsIcons[key];
        el.appendChild(a);
    });
}

function openPeopleModal(id) {
    const data = peopleData[id];
    if (!data) return;

    const modal   = document.getElementById('people-modal');
    const overlay = document.getElementById('people-modal-overlay');
    const panel   = document.getElementById('people-modal-panel');

    // 콘텐츠 채우기
    const photoEl = document.getElementById('people-modal-photo');
    if (photoEl) { photoEl.src = data.photo; photoEl.alt = data.name; }
    renderPeopleBadges(document.getElementById('people-modal-status'), data.status, 'md');
    const nameEl = document.getElementById('people-modal-name');
    if (nameEl) nameEl.textContent = data.name;
    _renderBioList(document.getElementById('people-modal-bio'), data.bio);
    _renderSns(document.getElementById('people-modal-sns'), data.sns);

    peopleModalLastFocused = document.activeElement;

    // 오버레이·모달 표시
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        const closeBtn = panel.querySelector('button[aria-label="닫기"]');
        if (closeBtn) closeBtn.focus();
    });

    document.addEventListener('keydown', handlePeopleModalKeydown);
}

function closePeopleModal() {
    const modal   = document.getElementById('people-modal');
    const overlay = document.getElementById('people-modal-overlay');
    const panel   = document.getElementById('people-modal-panel');

    overlay.classList.add('opacity-0');
    panel.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        overlay.classList.add('hidden');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);

    document.body.style.overflow = '';
    document.removeEventListener('keydown', handlePeopleModalKeydown);
    if (peopleModalLastFocused) peopleModalLastFocused.focus();
}
