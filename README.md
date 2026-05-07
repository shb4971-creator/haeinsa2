# 해인사 기와·연등불사 결제 MVP

## 기능
- 대웅전 지붕 기와 클릭/등록
- 대웅전 앞마당 연등 클릭/등록
- 기와/연등 모드 전환
- 연등 색상 선택
- 데모 등록
- 토스페이먼츠 결제창 호출
- 성공/실패 페이지
- Vercel Serverless 결제 승인 API

## 실행

```bash
npm install
npm run dev
```

## 환경변수

`.env.example`을 `.env`로 복사하고 토스페이먼츠 테스트 키를 입력하세요.

```env
VITE_TOSS_CLIENT_KEY=test_ck_...
VITE_APP_BASE_URL=http://localhost:5173
TOSS_SECRET_KEY=test_sk_...
```

## Vercel 배포

Vercel Environment Variables에도 동일하게 등록하세요.

```env
VITE_TOSS_CLIENT_KEY=test_ck_...
VITE_APP_BASE_URL=https://배포주소.vercel.app
TOSS_SECRET_KEY=test_sk_...
```

## 실사 사진 적용

`public/temple.jpg`를 넣고 `src/App.jsx`에서:

```js
const TEMPLE_PHOTO_URL = "/temple.jpg";
```

로 변경하세요.

## 다음 단계
- Supabase DB 저장
- 결제 승인 후 실제 기와/연등 점유 처리
- 관리자 승인/숨김
- 이름표 노출
- 야간 연등 점등 모드
- 공유 링크
