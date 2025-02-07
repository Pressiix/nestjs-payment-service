// status
export const CODE_TECHNICAL_ERROR = 1999;
export const CODE_BUSINESS_ERROR = 1899;
export const CODE_SUCCESS = 1000;

// config
export const PROM_PREFIX = process.env.PROM_PREFIX || 'bondbond_';
export const SERVER_PORT = (process.env.SERVER_PORT as unknown as number) || 3000;
export const DATABASE_TYPE = 'postgres';
export const DATABASE_SLAVE = 'slave';
export const LOGGER_ENABLE = process.env.LOGGER_ENABLE as unknown as boolean | true;
export const IS_EMPTY_VAULT_CONFIG = !process.env.VAULT_URL || !process.env.VAULT_PATH;
export const PRIVATE_KEY_PATH = (process.env.PRIVATE_KEY_PATH as unknown as string) || 'dist/ssl/keys/server.key';
export const CERTIFICATE_PATH =
  (process.env.PRIVATE_CERTIFICATE_PATH as unknown as string) || 'dist/ssl/keys/server.crt';
export const CACHE_MAX_DEFAULT = 100;
export const CACHE_MAX = 'CACHE_MAX';
export const CACHE_TTL_DEFAULT = 1800;
export const CACHE_TTL = 'CACHE_TTL';
export const CACHE_KEY_ALL = 'CACHE_ALL';
// header
export const ACCEPT_LANGUAGE_HEADER = 'accept-language';
export const DEFAULT_ACCEPT_LANGUAGE = 'TH';
export const LANGUAGE_TH = 'TH';
export const LANGUAGE_EN = 'EN';
export const USER_ID_HEADER = 'userid';
export const ACCEPT_LANGUAGE_LIST = ['EN', 'TH'];
export const CORRELATION_ID_HEADER = 'correlationid';
export const CONTENT_TYPE_APP_JSON = 'application/json';

// notification constants
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_TIMEZONE_FORMAT = 'YYYY-MM-DD[T]HH:mm:ssZ';
export const TIME_ZONE_BANGKOK = 'Asia/Bangkok';
export const DATE_TIMEZONE_ZULU_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
export const TIME_ZONE_OFFSET = 7;

export const CACHE_KEY_S3_TEMPLATE_HOME = '';
export const DELETE_BY_USER = 'USER';

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_TRANSACTION_LIST = 10;

export const COMMON_CONFIG_BUCKET = 'COMMON_CONFIG_BUCKET';
export const LOOKUP_CONFIG_PATH = 'LOOKUP_CONFIG_PATH';
export const LOOKUP_COMMON_FILE_NAME = 'LOOKUP_COMMON_FILE_NAME';
export const LOOKUP_MS_FILE_NAME = 'LOOKUP_MS_FILE_NAME';
export const LOOKUP_FILE_NAME = 'generic.response.status.json';

export const PROVISION_TEMP_SUSPEND_CACHE_KEY = (userRef: string) => `COIN:PROVISION_TEMP_SUSPEND_CACHE:${userRef}`;

// api token x
export const TOKEN_X_LOGGER_INSTANCE = 'TokenXLoggerHttpRequest';
export const TOKEN_X_BASE_URL = 'TOKEN_X_BASE_URL';
export const TOKEN_X_API_KEY = 'TOKEN_X_API_KEY';
export const TOKEN_X_SYSUSER_REF = 'TOKEN_X_SYSUSER_REF';
export const TOKEN_X_SYSUSER_PASSWORD = 'TOKEN_X_SYSUSER_PASSWORD';
export const TOKEN_X_WALLET_TYPE = 'CUSTOMER_MANAGED';
export const TOKEN_X_CODE_SUCCESS = '1000';
export const TOKEN_X_E2EE_SESSION_URL = '/auth/v1/session/initiate';
export const TOKEN_X_LOGIN_URL = '/auth/v1/login';
export const TOKEN_X_CREATE_ETHEREUM_ACCOUNT_URL = '/user/v1/account';
export const TOKEN_X_CREATE_USER = '/user/v2/user';
export const TOKEN_X_VERIFY_USER = '/user/v1/user/verify';
export const TOKEN_X_POLL = '/poll/v1/poll';
export const TOKEN_X_CONFIRM_USER_VOTE = (walletId: string, transactionId: string) =>
  `/wallet/v2/user/wallet/${walletId}/transaction/${transactionId}/confirm`;
export const TOKEN_X_USER_VOTE = (walletId: string) => `/wallet/v1/user/wallet/${walletId}/payment`;
export const TOKEN_X_CREATE_ORG_TRANS = (orgWalletId: string) =>
  `/wallet/v1/organization/wallet/${orgWalletId}/transfer`;
export const TOKEN_X_CONFIRM_ORG_TRANS = (orgWalletId: string, transactionId: string) =>
  `/wallet/v2/organization/wallet/${orgWalletId}/transaction/${transactionId}/confirm`;
export const TOKEN_X_APPROVE_ORG_TRANS = (orgWalletId: string, transactionId: string) =>
  `/wallet/v2/organization/wallet/${orgWalletId}/transaction/${transactionId}/approval`;
export const TOKEN_X_CREATE_USER_WALLET_URL = (userRef: string) => `/wallet/v1/user/${userRef}/wallet`;
export const TOKEN_X_WALLET_BALANCE_URL = (walletId: string) => `/wallet/v1/user/wallet/${walletId}/balance`;
export const TOKEN_X_USER_DETAIL = (userRef: string) => `/user/v1/user/${userRef}`;
export const TOKEN_X_USER_BALANCE_CACHE_PREFIX = 'COIN:TOKEN_X_USER_BALANCE';
export const TOKEN_X_USER_BALANCE_CACHE = (userRef: string) => `${TOKEN_X_USER_BALANCE_CACHE_PREFIX}:${userRef}`;
export const TOKEN_X_USER_WALLET_ALIAS_PREFIX = 'bbt-eth-';
export const TOKEN_X_USER_WALLET_ALIAS = (userRef: string) => `${TOKEN_X_USER_WALLET_ALIAS_PREFIX}${userRef}`;
export const TOKEN_X_USER_WALLET_NAME_PREFIX = 'bbt-wallet-';
export const TOKEN_X_USER_WALLET_NAME = (userRef: string) => `${TOKEN_X_USER_WALLET_NAME_PREFIX}${userRef}`;
export const TOKEN_X_TOKEN_CACHE_KEY = (userRef: string) => `COIN:TOKEN_X_USER_TOKEN_CACHE:${userRef}`;
export const TOKEN_X_CREATE_USER_TRANS = (userWalletId: string) => `/wallet/v1/user/wallet/${userWalletId}/transfer`;
export const TOKEN_X_CONFIRM_USER_TRANS = (userWalletId: string, transactionId: string) =>
  `/wallet/v2/user/wallet/${userWalletId}/transaction/${transactionId}/confirm`;
export const TOKEN_X_GET_USER_TRANS = (userWalletId: string, transactionId: string) =>
  `/wallet/v1/user/wallet/${userWalletId}/transaction/${transactionId}`;
export const TOKEN_X_CIRCUIT_BREAKER_KEY = 'TOKEN_X_CIRCUIT_BREAKER_KEY';
export const SYSTEM_TOKEN_CACHE_PREFIX = 'COIN:SYSTEM';
export const SYSTEM_TOKEN_CACHE = (tokenSymbol: string) => `${SYSTEM_TOKEN_CACHE_PREFIX}:${tokenSymbol}`;

// coin
export const TOKEN_DEFAULT_SYMBOL = 'BBT';
export const COIN_AVAILABLE = 'available';
export const COIN_UNAVAILABLE = 'unavailable';
export const COIN_INSUFFICIENT_BALANCE = 'insufficient-balance';
export const TOKEN_X_LABEL = 'TOKEN_X';
export const NON_TOKEN_X_LABEL = 'NON_TOKEN_X';

// error type
export const CREATE_USER_FAIL = 'create_user_fail';
export const GET_USER_FAIL = 'get_user_fail';
export const VERIFY_USER_FAIL = 'verify_user_fail';
export const GET_ETHEREUM_FAIL = 'get_ethereum_fail';
export const CREATE_ETHEREUM_FAIL = 'create_ethereum_fail';
export const GET_WALLET_FAIL = 'get_wallet_fail';
export const CREATE_WALLET_FAIL = 'create_wallet_fail';

// api notification ms
export const NOTIFICATION_BASE_URL = 'NOTIFICATION_BASE_URL';
export const NOTIFICATION_URL = '/v1/notification';

// sqs message constants
export const DEFAULT_SQS_MESSAGE_TRANSACTION_TYPE = 'EARN';
export const DEFAULT_SQS_MESSAGE_PAYMENT_TYPE = 'PAYMENT';
export const DEFAULT_SQS_MESSAGE_TRANSFER_TYPE = 'TOPUP';
