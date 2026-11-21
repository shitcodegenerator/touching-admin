export const securityEventTypeMap: Record<string, string> = {
  member_login_lockout: '會員登入失敗過多',
  admin_login_lockout: '後台登入失敗過多',
  password_reset_lockout: '重設密碼驗證碼錯誤過多',
  nosql_injection: '擋下 NoSQL injection',
}

export const scopeMap: Record<string, string> = {
  account_ip: '單一 IP',
  account: '整個帳號（多個 IP 累積）',
}
