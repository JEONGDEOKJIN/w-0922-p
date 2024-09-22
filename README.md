# 샵바이 오로라 스킨

샵바이에서 제공하는 모듈을 활용한 적응형 웹 스킨입니다.

## 기술 스펙
- [handlebarsjs](https://handlebarsjs.com/)
- [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [aurora modules](샵바이 모듈 가이드 링크 삽입 예정)

## 로컬에서 개발 서버 올리기

### 개발 환경 설정
- [ ] [NodeJS](https://nodejs.org/en) : v20.10.0 이상
  - 노드 버전관리(nvm)를 사용하는 것을 추천합니다.
  - `nvm`을 사용한다면 프로젝트 루트에서 `use nvm` 명령어로 오로라 스킨에서 권장하는 노드 버전을 설정할 수 있습니다.
- [ ] 패키지 매니저 : [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable)(yarn 1) 또는 [npm](https://www.npmjs.com/)
  - 오로라 스킨은 `yarn` 패키지 매니저를 사용합니다. `npm`을 사용하는 경우 프로젝트 내 `yarn.lock` 을 제거하세요.
  
### 저장소 클론

```sh
$ git clone https://token:{ACCESS_TOKEN}@skins.shopby.co.kr/{그룹명}/{프로젝트명}.git

# 예시
$ git clone https://token:생성한엑세스토큰@skins.shopby.co.kr/team-1027/aurora-example-project.git
```

<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/19d0c313-513d-49a8-af9f-1855204047c3">



> Access Token
> - [access token 생성하러 가기](https://skins.shopby.co.kr/-/profile/personal_access_tokens)
> - 프로젝트 접근 권한을 설정한 후 붉은 색으로 표기된 토큰 생성 버튼을 클릭합니다. 생성된 토큰을 복사해서 활용하시면 됩니다. 
> <img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/66871a20-ef3f-4ceb-8ee7-73266e22d096">
  

- 소스코드가 정상적으로 클론되었는지 확인하고, 해당 프로젝트로 이동합니다.

```sh
$ ls

$ cd aurora-example-project
```

<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/32a1ac0d-a4b5-4fc7-a520-2b1dbf9bb3eb">


> nvm이 설치되어 있다면 자동으로 노드 버전을 설정할 수 있습니다.
> <img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/7448d909-984e-46b3-92ff-99dbc52e1483">


### 의존성 설치
- 샵바이 스킨 개발을 위해 필요한 의존성을 설치합니다.

```sh
# yarn 사용 시
$ yarn install

# npm 사용 시
$ npm install
```

### clientId 세팅하기

`clientId`는 각 쇼핑몰을 구분하는 값으로 `shop API` 호출 시 필수 `request`값입니다. <br />
`{pc/mobile}/environment.json` 에 부여받은 `clientId`를 기입합니다.
  > `environment.json` 은 서버에서 주입하는 파일이기 때문에 프로덕션에서는 디렉토리 내 존재할 필요가 없지만, 로컬에서 서버를 구동하기 위해서는 필요한 파일입니다.
  <img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/f497b69d-bb9c-4ff6-9427-9a66ae56d08a">


- `clientId` 확인 방법
  - shop by pro : `쇼핑몰도메인/environment.json` 에서 확인 가능
    <br />예) `example.shopby.co.kr/environment.json`
  - shop by premium :
      - 서비스어드민 : 서비스관리 > 쇼핑몰관리 > (쇼핑몰 선택) > 개발연동정보 > 클라이언트 아이디에서 확인 가능
      - `쇼핑몰도메인/environment.json` 에서 확인 가능
      <br />예) `example.shopby.co.kr/environment.json`

### 개발 서버 띄우기

- 개발 서버 구동 스크립트는 `package.json > scripts` 를 참고하세요.

```sh
# yarn 패키지 PC 버전 (serve 혹은 serve:pc)
$ yarn serve
$ yarn serve:pc

# yarn 패키지 MOBILE 버전
$ yarn serve:mobile


# npm 패키지 PC 버전 (serve 혹은 serve:pc)
$ npm run serve
$ npm run serve:pc

# npm 패키지 MOBILE 버전
$ npm run serve:mobile
```

개발 서버가 구동되면 자동으로 웹 브라우저가 열립니다. 열리지 않는 경우 웹 브라우저를 열고 `Access URLs` 항목을 확인해 `http://localhost:포트번호` 로 접속합니다.
<br />
<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/9682e909-abad-4a4c-8ad2-b476165b051e">


## 릴리즈 패치하기

패치가 필요한 프로젝트 `remote` 에 `upstream`으로 오로라 저장소를 추가합니다.

```sh
$ git remote add upstream https://skins.shopby.co.kr/shopby/aurora-vanilla.git

$ git remove -v
```

<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/e46380cb-c7cf-4bec-8bca-d570d695e92c">

오로라 저장소의 `main` 을 패치합니다.

```sh
$ git fetch upstream main
```

<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/f4584da8-4b31-4e37-9b1f-6e827e8833fb">

패치한 `main`을 병합합니다.

```sh
$ git merge upstream/main
```

`unrelated histories` 오류가 발생한다면 하기 옵션을 추가해 병합합니다.

```sh
$ git merge upstream/main --allow-unrelated-histories
```

<img width="650" alt="image" src="https://github.com/nhn-commerce-fe/test-cdn/assets/131448949/11a82adb-2ed6-4b84-9eec-849894466260">

패치받은 버전을 병합하면 충돌이 발생할 수 있습니다. <br />
에디터에서 충돌 해결 후 개발 저장소에 `push` 하시면 최신 버전 패치가 완료됩니다.