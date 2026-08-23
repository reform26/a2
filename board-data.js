// ============================================================
//  board-data.js
//  공지사항(noticeData) 게시물 데이터 — 구글 스프레드시트 연동
//
//  구글 스프레드시트 + Apps Script 웹 앱을 데이터 소스로 사용합니다.
//  아래 NOTICE_SHEET_API_URL 에 배포된 웹 앱 URL을 붙여넣으면
//  스프레드시트에 새 행을 추가하는 것만으로 공지사항이 갱신됩니다.
//
//  스프레드시트 컬럼 구성 (1행 헤더):
//    A: id      예) notice_001   (다른 행과 겹치지 않는 고유 값)
//    B: type    예) 공지사항 / 일정  (분류명, 자유롭게 추가 가능)
//    C: title   글 제목
//    D: date    예) 2026.07.15
//    E: views   조회수 (숫자)
//    F: content 본문 내용 (셀 안에서 Alt+Enter로 줄바꿈하면 문단으로 분리됩니다)
// ============================================================

// 🔧 [필수] Apps Script [배포]→[새 배포]로 생성한 웹 앱 URL을 아래에 붙여넣으세요.
//    형식: https://script.google.com/macros/s/xxxxxxxx/exec
const NOTICE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxe1mD95jWSTDM89ubELbAGznGjZqtSHrqzcrl5htcb1LBsAZ5bx9s4q6CcU4f3cigQ/exec';

// 공지사항 게시물 데이터 — 구글 시트에서 비동기로 채워집니다.
// (초기값은 빈 값이며, noticeDataReady Promise가 끝난 뒤에 실제 값이 채워집니다)
let noticeData = {};
let noticeOrder = [];

// 시트의 type(분류) 값에 따른 뱃지 색상 매핑
// 새로운 분류를 쓰고 싶다면 이 객체에 항목을 추가하세요.
const NOTICE_TYPE_CLASS = {
    '공지':     'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    '공지사항': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    '일정':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    '보도자료': 'bg-orange-100 text-reform-500 dark:bg-orange-900/30 dark:text-orange-400',
};
const NOTICE_TYPE_CLASS_DEFAULT = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';

// 구글 시트 한 행(row)을 사이트에서 쓰는 게시물 객체 형태로 변환
function _mapSheetRowToNotice(row) {
    const type = (row.type || '공지사항').toString().trim();
    let body;
    if (Array.isArray(row.content)) {
        body = row.content.map(p => p.toString()).filter(p => p.trim() !== '');
    } else {
        body = [String(row.content || '')];
    }
    if (body.length === 0) body = [''];

    return {
        category: type,
        categoryClass: NOTICE_TYPE_CLASS[type] || NOTICE_TYPE_CLASS_DEFAULT,
        title: (row.title || '').toString(),
        date: (row.date || '').toString(),
        views: Number(row.views) || 0,
        body: body
    };
}

// 구글 스프레드시트(Apps Script 웹 앱)에서 공지사항 데이터를 가져와
// noticeData / noticeOrder 를 채웁니다.
// index.html 쪽 렌더링 코드는 반드시 이 Promise(noticeDataReady)가
// 끝난 뒤에 목록·모달을 그려야 합니다.
const noticeDataReady = (async function loadNoticeDataFromSheet() {
    try {
        const res = await fetch(NOTICE_SHEET_API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('시트 응답 오류: HTTP ' + res.status);
        const rows = await res.json();
        if (!Array.isArray(rows)) throw new Error('예상치 못한 응답 형식입니다.');

        const data = {};
        rows.forEach(row => {
            const id = String(row.id || '').trim();
            if (!id) return; // id가 없는 행은 건너뜀
            data[id] = _mapSheetRowToNotice(row);
        });

        // 날짜 내림차순(최신순) 정렬. 날짜가 같으면 id 역순으로 보조 정렬.
        const order = Object.keys(data).sort((a, b) => {
            const da = data[a].date, db = data[b].date;
            if (da !== db) return da > db ? -1 : 1;
            return b.localeCompare(a);
        });

        noticeData = data;
        noticeOrder = order;
        return true;
    } catch (err) {
        console.error('[공지사항] 구글 스프레드시트 데이터를 불러오지 못했습니다:', err);
        noticeData = {};
        noticeOrder = [];
        return false;
    }
})();

// ============================================================
//  조회수 자동 증가
//
//  게시물 상세 모달을 열 때 호출됩니다. 같은 브라우저 세션(탭을 닫기 전까지)에서
//  동일한 게시물을 여러 번 열어도 중복으로 카운트되지 않도록
//  sessionStorage로 이미 조회한 id를 기록해 둡니다.
// ============================================================
function incrementNoticeView(id) {
    if (!id || !noticeData[id]) return;

    // 이번 세션에서 이미 조회수를 올린 게시물이면 서버 요청을 보내지 않음
    const viewedKey = 'notice_viewed_' + id;
    try {
        if (sessionStorage.getItem(viewedKey)) return;
        sessionStorage.setItem(viewedKey, '1');
    } catch (e) {
        // sessionStorage를 쓸 수 없는 환경(프라이빗 모드 등)이면 그냥 계속 진행
    }

    // 화면에는 먼저 즉시 반영(체감 반응 속도용). 서버 반영은 비동기로 처리.
    noticeData[id].views = (Number(noticeData[id].views) || 0) + 1;

    const url = NOTICE_SHEET_API_URL
        + '?action=incrementView&id=' + encodeURIComponent(id);

    fetch(url, { method: 'GET', cache: 'no-store' })
        .catch(err => {
            console.error('[공지사항] 조회수 증가 요청 실패:', err);
        });
}
