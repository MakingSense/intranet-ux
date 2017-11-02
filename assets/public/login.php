<?php
require_once '../app/_tools.php';

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

    <!-- Custom styles for this template -->
    <link href="starter-template.css" rel="stylesheet">
  </head>
    <style>
      html, body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .account-wall {
        margin-top: 20px;
        padding: 40px 20px 20px 20px;
        background-color: #f7f7f7;
        -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        text-align: center;
      }
      .login-title {
        color: #555;
        font-size: 18px;
        font-weight: 400;
        display: block;
      }
      .profile-img {
        width: 96px;
        height: 96px;
        margin: auto;
        display: block;
        -moz-border-radius: 50%;
        -webkit-border-radius: 50%;
        border-radius: 50%;
      }
      picture {
        margin-bottom: 30px;
      }
      figcaption {
        font-weight: bold;
        margin: 10px 0;
      }
      .error {
        color: red;
        padding: 10px 0;
      }
      .signedin-desc {
        padding-bottom: 20px;
      }
      .btn-login {
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="row">
          <div class="col-sm-6 col-md-4 col-md-offset-4">
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
                    <div class="error">This account does not have permissions to continue.</div>
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