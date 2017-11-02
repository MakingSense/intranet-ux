<?php
include __DIR__ . '/../vendor/Google/autoload.php';
include __DIR__ . '/_config.php';
@session_start();

// get google client instance
function getGClient() {
  static $client = null;
  if (!$client) {
    $client = new Google_Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI);
    $client->setAccessType("offline");
    $client->addScope("email");
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
  unset($_SESSION['userinfo']);
}

function saveToken($token) {
  $client = getGClient();
  $client->authenticate($token);
  $_SESSION['access_token'] = $client->getAccessToken();
  return $_SESSION['access_token'];
}

function sessionCheck() {
  if (!@$_SESSION['access_token']) return false;
  $client = getGClient();
  @$client->setAccessToken($_SESSION['access_token']);
  if ($client->isAccessTokenExpired()) {
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