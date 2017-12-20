<?php
require_once 'app/_tools.php';

$code = @$_GET['code'];
if (($code && saveToken($code))) {
  header('location: ./dash');
  exit;
}

$info = getUserInfo();

$url = getAuthUrl();
?>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Login with Google to continue...</title>
    <!-- Bootstrap core CSS -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link href="css/login.css" rel="stylesheet">
  </head>
  <body>
    <div class="container">
      <div class="row">
          <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
            <div class="panel">
              <h1 class="text-center login-title">Sign in to continue to MS</h1>
              <?php if ($info) { ?>
                <div class="account-wall">
                  <div class="signedin-desc">You are currently signed in as:</div>
                  <picture>
                    <img class="profile-img" src="<?php echo $info->picture; ?>" alt="<?php echo $info->email; ?>">
                    <figcaption><?php echo $info->email; ?></figcaption>
                  </picture>
                  <?php if ($info->hd !== ALLOWED_DOMAIN) { ?>
                    <div class="error">You cannot access with this account.</div>
                  <?php } else { ?>
                    <a class="btn btn-lg btn-success btn-block btn-login" href="/dash">Continue</a>
                    <br />
                  <?php } ?>
                  <a class="btn btn-lg btn-primary btn-block btn-login" href="<?php echo $url; ?>">Change Google account</a>
                  <a class="btn btn-lg btn-danger btn-block btn-login" href="/logout">Log Out</a>
                </div>
              <?php } else { ?>
                <div class="account-wall">
                  <picture>
                    <img class="profile-img" src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120" alt="">
                  </picture>
                  <a class="btn btn-lg btn-primary btn-block btn-login" href="<?php echo $url; ?>">Sign in with Google</a>
                </div>
              <?php } ?>
            </div>
          </div>
      </div>
    </div>
  </body>
</html>