<?php
	$id = $_GET["id"];
?>

<!DOCTYPE html>
<html lang="en" ng-app="feedbackApp">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Goover</title>

	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jquery-ui.js"></script>
	<script type="text/javascript" src="js/keymaster.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.13/angular.min.js"></script>

	<script type="text/javascript" src="js/modules/center.js"></script>
    <script type="text/javascript" src="js/modules/comments.js"></script>
	<script type="text/javascript" src="js/modules/contenteditable.js"></script>
	<script type="text/javascript" src="js/modules/draggable.js"></script>
	<script type="text/javascript" src="js/modules/elastic.js"></script>
	<script type="text/javascript" src="js/modules/focus.js"></script>
	<script type="text/javascript" src="js/modules/imagedrop.js"></script>
	<script type="text/javascript" src="js/modules/stretch.js"></script>
	<script type="text/javascript" src="js/modules/timesince.js"></script>
	<script type="text/javascript" src="js/modules/ui-sortable.js"></script>
	<script type="text/javascript" src="js/modules/auth.js"></script>

	<script type="text/javascript" src="https://cdn.firebase.com/v0/firebase.js"></script>
	<script type="text/javascript" src="https://cdn.firebase.com/libs/angularfire/0.6.0/angularfire.min.js"></script>
	<script type="text/javascript" src="js/firebase-simple-login.js"></script>

	<script type="text/javascript" src="js/goover.js"></script>
	<script type="text/javascript" src="js/trail.js"></script>

	<script type="text/javascript" src="//use.typekit.net/qxg4wno.js"></script>
	<script type="text/javascript">try{Typekit.load();}catch(e){}</script>

	<link rel="stylesheet" type="text/css" href="css/style.css">

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body ng-controller="FeedbackController" ng-init="init(<?php echo $id; ?>)" fullscreen>
	<div id="mouseTracker"><div ng-repeat="cursor in cursors" cursor style="position: absolute;width:10px; height: 10px; background: #ff0000; z-index: 2000"></div></div>

	<!-- start edit brief -->

	<div id="overlay" ng-show="editBrief == true">
		<div id="brief">
			<div class="brief-content">
				<div class="brief-author" ng-hide="true">
					<img src="images/me.png">
					<strong class="brief-name light">Florian</strong><span class="brief-date light">Yesterday</span>
				</div>

				<h3>Write your brief</h3>
				<label for="ownerName">Let others know who you are</label>
				<input id="ownerName" type="text" ng-model="project.owner" placeholder="Your name e.g. Tim Cook" />

				<textarea id="theBrief" msd-elastic ng-model="project.brief" autofocus="true"></textarea>


				<p ng-show="project.owner">
					Kindly,<br>
					<strong>{{project.owner}}</strong>
				</p>

				<div class="brief-info">
					<p>Please note that the following images are the <strong>first draft.</strong> Images are placeholder stock images and will be replaced in the final version.</p>
				</div>

				<button class="btn btn-primary" ng-click="saveBrief()">Share</button>
				<span ng-show="project.hasBrief">{{projectpath}}</span>

			</div>
		</div>
	</div>
	<!-- end edit brief -->


	<!-- start read brief -->

	<div id="overlay" ng-hide="true">
		<div id="brief">
			<div class="brief-content">
				<div class="brief-author">
					<img src="images/me.png">2
					<strong class="brief-name light">{{project.owner}}</strong> (Online)<span class="brief-date light">Yesterday</span>
				</div>


				<h3>Feedback Request</h3>

				<div ng-show="!project.brief" class="loading"></div>
				<p>
					{{project.brief}}
				</p>

				<p>
					Kindly,<br>
					<strong>{{project.owner}}</strong>
				</p>

				<div class="brief-info">
					<p>Please note that the following images are the <strong>first draft.</strong> Images are placeholder stock images and will be replaced in the final version.</p>
				</div>

				<div class="brief-footer">
					<form id="enter-name">
						<label for="name">Please enter your name to leave some feedback.</label>
						<input type="text" placeholder="Your Name" id="name" ng-model="username" class="form-control-inline form-control-naked" capitalize-first autofocus />
						<button class="btn" type="submit" ng-class="{btnokay: username!='', btndisabled:username==''}" class="form-block" ng-click="briefRead=true">Okay, let’s do this!</button>
					</form>
				</div>
			</div>
		</div>
	</div>

	<!-- end read brief -->

	<div imagedrop id="dropzone" on-image-drop="imageDropped()"><h1 center>Drop Images to Upload</h1></div>

	<!-- wrap -->
	<!-- header -->

		<header>
			<div class="header-left header-section">
				<ul class="nav-items">
					<li class="nav-item nav-item-logo cfix">Goover</li>
					<li class="nav-item nav-item-last cfix" id="login" ng-controller="AuthController" ng-show="username">
						<a href="" class="nav-link"><span class="icon icon-before">&#xf043;</span><span class="light">Hello,&nbsp;</span><strong>{{username}}!</strong></span></a>
					</li>
				</ul>
			</div>

			<div class="project-title header-section" ng-show="project.images.length!=0">

				<!--<h2 ng-show="currentIndex == 0"><a href="" class="header-link">—</a></h2>

				<h2 ng-show="project.images[currentIndex-1].filename">
					<a href="" class="header-link" ng-click="currentIndex = currentIndex-1">{{project.images[currentIndex-1].filename}}
					</a>
				</h2>

			-->

				<h1 click-to-edit="selectedImage.filename">
					<a href="" class="header-link">{{selectedImage.filename}}</a>
				</h1>
				<!--
				<h2 ng-show="project.images[currentIndex+1].filename">
					<a href="" class="header-link" ng-click="currentIndex = currentIndex + 1">{{project.images[currentIndex+1].filename}}</a>
				</h2>
				<h2 ng-show="currentIndex == project.images.length - 1"><a href="" class="header-link">—</a></h2>
				-->
			</div>

			<div class="header-right header-section">

				<ul class="nav-items">
					<!--
					<li><a href=""><h2 ng-click="prev()"></h2></a></li>
					<li><a href=""><h2 ng-click="next()" ng-class="{flash:flashnext}"></h2></a></li>
					<li><a href=""><span class="icon before">b</span><h2>New Set</h2></a></li>
				-->
					<li class="nav-item">
						<a class="nav-link" ng-click="toggleFullscreen()"><span class="icon icon-before">&#xf0a4;</span>Present<span class="key">P</span></a>
					</li>
					<li class="nav-item">
						<a ng-click="showBrief()" class="btn btn-primary">Share</a>
					</li>
				</ul>
			</div>

		</header>

		<!-- // end of header -->

	<div class="wrap">

		<!-- sidebar -->

		<aside id="left" class="animated" selectedscroll ng-hide="project.images.length == 0">
			<div id="leftspacer"></div>
			<ul>
				<li class="add-image upload-icon" filepicker order="before">c</li>
				<ul id="overview" ui-sortable ng-model="project.images" ng-class="{slideOut: !overviewShowing}">
					<li ng-repeat="(id, image) in project.images" ng-click="selectImage(id)" ng-class="{selected:image.path==selectedImage.path}"><img ng-src="{{image.path}}" /><span ng-click="removeImage(id)" class="icon removeimage">y</span></li>
				</ul>
				<li ng-hide="project.images.length == 0" class="add-image upload-icon" filepicker order="after">c</li>
			</ul>
		</aside>

		<!-- // end of sidebar -->
		<!-- Comments -->

		<aside class="feedback">


			<!-- title, search -->

			<div class="feedback-header">
				<h3 class="spacing upper-title">Feedback</h3>
				<fieldset class="with-icon">
					<span class="icon input-icon icon-search">&#xf097;</span>
					<input type="search" value="" ng-model="search" class="form-control">
				</fieldset>
			</div>


			<!-- list of users -->

			<!--
			<div id="users">
				<button ng-show="me" class="btn btn-danger btn-sm" ng-click="logout()">Logout</button>
				<span class="space" ng-hide="users.length == 0"><span class="icon before">E</span><span>On it now:&nbsp;</span><strong ng-repeat="user in users" ng-show="user.connections">{{user.name.first}}<span ng-show="!$last">, </span></strong></span>
			</div>
			-->

			<!-- feedback for the current image -->

			<div class="feedback-body">
                <div>

                    <!-- image title for the following comments -->

                    <!--

                    <div class="clickable feedback-title" ng-mouseenter="disableAnnotationTransition()" ng-mousemove="$index==currentIndex && showAllAnnotations()" ng-mouseleave="$index==currentIndex && hideAllAnnotations()">{{image.filename}}</div>

                    -->

                    <!-- the actual comments -->

                    <div class="feedback-content">
                        <comments comments-data="selectedImage.annotations" username="username"></comments>
                    </div>
                </div>
            </div>
		</aside>
		<!-- // end of comments -->

		<!-- main -->

		<div id="main" ng-class="{hasimages:project.images.length != 0}">
			<div id="landing" ng-hide="project.images.length != 0">
				<div id="uploadarea" ng-controller="AuthController">
					<h2>Start now</h2>
					<p>Use Goover for free to share what you are working on and get feedback from friends, colleagues and the rest of the world. </p>
					<div filepicker order="before" class="emptystate" ng-show="project.images.length == 0"><div class="add-image upload-icon">c</div><h2>Drag & Drop Images Here</h2></div>
				</div>

				<div id="auth" ng-controller="AuthController">
					<p>Sign up if you want to create private projects and only share with those you invite.</p>
					<h2>Sign up</h2>
					<form>
						<input class="form-control form-group" type="text" ng-model="newemail" placeholder="Email">
						<input class="form-control form-group" type="password" ng-model="newpassword" placeholder="Password">
						<input class="form-control form-group" type="text" ng-model="firstname" placeholder="First name">
						<input class="form-control form-group" type="text" ng-model="lastname" placeholder="Last name">
						<button class="btn btn-primary btn-sm" ng-click="createUser(newemail, newpassword, firstname, lastname)">Sign up</button>
					</form>
					<h2>Login</h2>

					<form class="form-inline">
						<input class="form-control" type="text" ng-model="email" placeholder="Email">
						<input class="form-control" type="password" ng-model="password" placeholder="Password">
						<button class="btn-login" ng-click="login(email, password)">Log in</button>
					</form>

				</div>
			</div>

			<div id="imgwrapper">
				<img annotatable ng-src="{{selectedImage.path}}" class="current-screen" ng-keypress="setActive(-1)" ng-click="addAnnotation($event)"  />
				<div draggable handle=".handle" annotation ng-repeat="(id, annotation) in selectedImage.annotations" ng-if="imageLoaded" class="circle note" annotationid="id" ng-click="setActive(id)" a="annotation" image="imageElement">
					<!--<div ng-class="{pulsegreen:annotation.type=='idea', pulseblue:annotation.type=='onit', pulsepurple:annotation.type=='question'}" class="handle"></div>-->
					<div class="handle">{{$index + 1}}</div>
					<div tooltip class="tooltip" ng-class="{open: id==selectedAnnotation|| showingAll==true}" ng-keydown="blurTooltip($event, $index)" a="annotation" username="username" id="id" types="commentTypes"></div>
				</div>
			</div>
		</div>

		<!-- // end of main -->
	</div>

	<!-- // end of wrap -->

	<input type="file" id="filepicker" multiple uploader>
	<!--<canvas id='world'></canvas>-->
	<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
</body>
</html>
