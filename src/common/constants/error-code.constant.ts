export enum ErrorEnum {
  // 验证码有误 用户相关10
  INVALID_VERIFICATION_CODE = '10002:errorMsg.invalidVerificationCode',

  // 用户相关
  USER_NOT_FOUND = '11001:errorMsg.userNotFound',
  USER_INVALID_USERNAME_PASSWORD = '11002:errorMsg.userInvalidUsernamePassword',
  USER_INVALID_LOGIN_TOKEN = '11003:errorMsg.userInvalidLoginToken',
  USER_INVALID_LOGIN = '11004:errorMsg.userInvalidLogin',
  USER_NO_LOGIN = '11005:errorMsg.userNoLogin',
  USER_INVALID_LOGIN_TOKEN_EXPIRE = '11006:errorMsg.userInvalidLoginTokenExpire',
  USER_CAPTCHA_ERROR = '11006:errorMsg.userCaptchaError',
  USER_EXISTS = '11007:errorMsg.userExists',

  // 菜单相关
  PERMISSION_REQUIRES_PARENT = '12001:errorMsg.permissionRequiresParent',
  PARENT_MENU_NOT_FOUND = '12002:errorMsg.parentMenuNotFound',
  ILLEGAL_OPERATION_DIRECTORY_PARENT = '12003:errorMsg.illegalOperationDirectoryParent'
}
