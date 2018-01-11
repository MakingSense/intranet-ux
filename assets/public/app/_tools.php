<?php
include __DIR__ . '/../vendor/Google/autoload.php';
include __DIR__ . '/_config.php';
@session_start();

function forceHttps() {
  var_dump($_SERVER); exit;
  if (@$_SERVER['HTTPS'] === 'localhost') return;
  if (@$_SERVER['HTTPS'] == 'on')  {
    unset($_SESSION['https_redirected']);
    return;
  } elseif ($_SESSION['https_redirected']) {
    die('HTTPS Protocol error. Please, notify the site admin.');
  }
  $_SESSION['https_redirected'] = true;
  $redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: {$redirect}");
  exit;
}

// get google client instance
function getGClient() {
  static $client = null;
  if (!$client) {
    $client = new Google_Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI);
    $client->setAccessType('offline');
    $client->addScope('email');
    $client->addScope('profile');
    try {
      if ($token = getGToken()) @$client->setAccessToken($token);
    } catch (Exception $e) {
      // Access token is wrong, discarded.
    }
  }
  return $client;
}

function getPeopleService() {
  static $info = null;
  if (!$info) {
    $client = getGClient();
    $info = new Google_Service_Oauth2($client);
  }
  return $info;
}

function logout() {
  $client = getGClient();
  $token = @json_decode($_SESSION['access_token'])->access_token;
  $client->revokeToken($token);
  unset($_SESSION['access_token']);
  setcookie('access_token', '', time() - 3600);
  unset($_SESSION['userinfo']);
}

function saveToken($token) {
  $client = getGClient();
  $client->authenticate($token);
  _setGToken($client->getAccessToken());
  return $_SESSION['access_token'];
}

function sessionCheck() {
  $client = getGClient();
  if (!$client || $client->isAccessTokenExpired()) {
    logout();
    return false;
  }
  try {
    $info = getPeopleService();
    $userinfo = $info->userinfo->get();
    $_SESSION['userinfo'] = $userinfo;
  } catch (Exception $e) {
    return false;
  }
  $domain = $userinfo->hd;
  return $domain === ALLOWED_DOMAIN;
}

function getUserInfo() {
  return @$_SESSION['userinfo'];
}

function getAuthUrl() {
  $client = getGClient();
  $url = $client->createAuthUrl();
  return $url;
}

function _setGToken($token) {
  $_SESSION['access_token'] = $token;
  setcookie('access_token', $token, time() + COOKIE_LIFE, "/");
}

function getGToken() {
  return @$_SESSION['access_token'] ?: @$_COOKIE['access_token'];
}

function fetchData() {
  $info = getUserInfo();
  $data = array();
  $data['first_name'] = $info->givenName;
  $data['last_name'] = $info->familyName;
  $data['email'] = $info->email;
  $data['avatar'] = $info->picture;
  $data['site-url'] = SITE_URL;
  return $data;
}

function processTemplate($data, $tpl) {
  $html = $tpl;
  foreach ($data as $field => $value) {
    $html = str_replace('{{' . $field . '}}', $value, $html);
  }
  return $html;
}

function loadTemplate($data, $file) {
  $tpl = file_get_contents($file);
  return processTemplate($data, $tpl);
}