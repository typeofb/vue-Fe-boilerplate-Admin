/**
 * 커밋 메시지 규칙 (Conventional Commits)
 *   <type>(<scope>): <subject>
 *   예) feat(user): 회원 목록 엑셀 다운로드 추가
 *       fix(api): 토큰 재발급 중 동시 요청 누락 수정
 */
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
        ],
        // 한글 subject 허용
        'subject-case': [0],
        'header-max-length': [2, 'always', 100],
    },
};
