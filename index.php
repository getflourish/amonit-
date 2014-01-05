<?php
	$id = $_GET["id"];
?>

<!DOCTYPE html>
<html lang="en" ng-app="feedbackApp">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Amonit – What do you think?</title>

	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jquery-ui.js"></script>
	<script type="text/javascript" src="js/keymaster.min.js"></script>
	<script type="text/javascript" src="js/angular.js"></script>
	
	<script type="text/javascript" src="js/modules/center.js"></script>
	<script type="text/javascript" src="js/modules/contenteditable.js"></script>
	<script type="text/javascript" src="js/modules/draggable.js"></script>
	<script type="text/javascript" src="js/modules/focus.js"></script>
	<script type="text/javascript" src="js/modules/imagedrop.js"></script>
	<script type="text/javascript" src="js/modules/stretch.js"></script>
	<script type="text/javascript" src="js/modules/ui-sortable.js"></script>
	<script type="text/javascript" src="js/modules/auth.js"></script>
	
	<script type="text/javascript" src="js/firebase.js"></script>
	<script type="text/javascript" src="js/angularfire.min.js"></script>
	<script type="text/javascript" src="js/firebase-simple-login.js"></script>
	
	<script type="text/javascript" src="js/amonit.js"></script>
	<script type="text/javascript" src="js/trail.js"></script>

	<link rel="stylesheet" type="text/css" href="css/style.css">

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body ng-controller="FeedbackController" ng-init="init(<?php echo $id; ?>)" fullscreen>
	<div id="mouseTracker"><div ng-repeat="cursor in cursors" cursor style="position: absolute;width:10px; height: 10px; background: #ff0000; z-index: 2000"></div></div>

	<!-- header -->

	<header>
		<div>
			<span class="logo space"><em>Am</em>onit</span>
			<div class="space split-button">
				<span class="inset splitbutton-left" href="/amonit2/{{data.path}}">
					<?php 
						if($_GET["id"]) {
							echo "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
						} else {
							echo "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . $id;
						}

						?>{{id}}</span>
				<button class="btn-sm inset-button splitbutton-right">Share</button>
			</div>
		</div>
		<div id="login" ng-controller="AuthController">
			<span class="space" ng-show="me"><span class="icon before">U</span><span class="light">Hello,&nbsp;</span><strong>{{me.first}}!</strong></span>
			<span class="space" ng-hide="me"><span class="icon before">U</span><strong>Login</strong></span>

			<form ng-hide="true" class="form-inline">
				<input class="form-control form-group" type="text" ng-model="newemail" placeholder="Email">
				<input class="form-control form-group" type="password" ng-model="newpassword" placeholder="Password">
				<input class="form-control form-group" type="text" ng-model="firstname" placeholder="First name">
				<input class="form-control form-group" type="text" ng-model="lastname" placeholder="Last name">
				<button class="btn btn-primary btn-sm" ng-click="createUser(newemail, newpassword, firstname, lastname)">Sign up</button>
			</form>
			
			<form ng-hide="true" class="form-inline">
				<input class="form-control" type="text" ng-model="email" placeholder="Email">
				<input class="form-control" type="password" ng-model="password" placeholder="Password">
				<button class="btn-login" ng-click="login(email, password)">Log in</button>
			</form>
			<button ng-show="me" class="btn btn-danger btn-sm" ng-click="logout()">Logout</button>
			<span class="space" ng-hide="users.length == 0"><span class="icon before">E</span><span>On it now:&nbsp;</span><strong ng-repeat="user in users" ng-show="user.connections">{{user.name.first}}<span ng-show="!$last">, </span></strong></span>
		</div>
		<div class="center" ng-show="false">
			<h5 ng-show="images.length!=0">{{images[currentIndex-1].filename}}</h5>
			<h4 ng-show="images.length!=0" click-to-edit="current.filename">{{current.filename}}</h4>
			<h5 ng-show="images.length!=0">{{images[currentIndex+1].filename}}</h5>
		</div>
		<div class="button-group right">
			<div class="space"><span class="icon before">b</span><h2>Make a new one</h2></div>	
			<div class="space"><span class="icon before">G</span><h2>Invite others</h2></div>	
			<div class="space"><a href=""><span class="icon before">`</span><h2 ng-click="toggleFullscreen()">Present</h2><span class="key">P</span></a></div>	
		</div>
		<div class="button-group right">
			<div class="space"><a href=""><h2 ng-click="prev()">Previous</h2><span class="key">↑</span></a></div>	
			<div class="space"><a href=""><h2 ng-click="next()" ng-class="{flash:flashnext}">Next</h2><span class="key">↓</span></a></div>	
		</div>

		<!--
		<div class="user" ng-show="false">
			Moderator: <strong>Florian Schulz</strong><br>
			Viewing: 
↑
			<div id="login" ng-controller="AuthController" ng-hide="true">

				<ul>
					<li ng-repeat="user in users" ng-show="user.connections">{{user.name.first}}</li>
				</ul>

				<form ng-hide="me" class="form-inline">
					<input class="form-control form-group" type="text" ng-model="newemail" placeholder="Email">
					<input class="form-control form-group" type="password" ng-model="newpassword" placeholder="Password">
					<input class="form-control form-group" type="text" ng-model="firstname" placeholder="First name">
					<input class="form-control form-group" type="text" ng-model="lastname" placeholder="Last name">
					<button class="btn btn-primary btn-sm" ng-click="createUser(newemail, newpassword, firstname, lastname)">Sign up</button>
				</form>
				
				<form ng-hide="me" class="form-inline">
					<input class="form-control" type="text" ng-model="email" placeholder="Email">
					<input class="form-control" type="password" ng-model="password" placeholder="Password">
					<button class="btn btn-success btn-sm" ng-click="login(email, password)">Log in</button>
				</form>
				<button ng-show="me" class="btn btn-danger btn-sm" ng-click="logout()">Logout</button>
			</div>
		</div>
	-->

	</header>

	<!-- // end of header -->

	<div imagedrop id="dropzone" on-image-drop="imageDropped()"><h1 center>Drop Images to Upload</h1></div>

	<!-- wrap -->

	<div id="wrap">

		<!-- sidebar -->
	
		<aside id="left" class="animated" selectedscroll ng-hide="images.length == 0">
			<div id="leftspacer"></div>
		<ul>
			<li class="add-image upload-icon" filepicker order="before">c</li>
			<ul id="overview" ui-sortable ng-model="images" ng-class="{slideOut: !overviewShowing}">
				<li ng-repeat="image in images" ng-click="setImage($index)" ng-class="{selected:$index==currentIndex}"><img ng-src="{{image.path}}" /><span ng-click="removeImage($index)" class="icon light removeimage">y</span></li>
			</ul>
			<li ng-hide="images.length == 0" class="add-image upload-icon" filepicker order="before">c</li>
		</ul>
		</aside>
	
		<!-- // end of sidebar -->
	
		<div id="content">
	
		<!-- main -->
	
			<div id="main">
				<div filepicker order="before" class="emptystate" ng-show="images.length == 0"><div class="add-image upload-icon">c</div><h2>Drag & Drop Images Here</h2></div>
				<div ng-hide="images.length==0" id="imgwrapper" class="flex">
					<img annotatable ng-src="{{current.path}}" class="current-screen" ng-keypress="setActive(-1)" ng-click="addAnnotation($event.offsetX, $event.offsetY)" />
					<div draggable handle=".handle" annotation ng-repeat="annotation in current.annotations" ng-if="imageLoaded" class="circle note" ng-class="{animate:$index!=selectedAnnotation, large:$index==selectedAnnotation}" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)" annotationid="{{$index}}">
						<div ng-class="{pulsegreen:annotation.type=='idea', pulseblue:annotation.type=='onit', pulsepurple:annotation.type=='question'}" class="handle"></div>
						<span class="tooltip" ng-class="{open: $index==selectedAnnotation || showingAll==true}" ng-keydown="blurTooltip($event, $index)" a="annotation" id="$index" types="commentTypes" tooltip></span>
					</div>
				</div>
			</div>
		
			<!-- // end of main -->
	
			<!-- Comments -->
		
			<aside class="flex" id="right" ng-hide="images.length == 0">
				<div id="feedback-header" class="fill-brown">
					<h3 class="text-light spacing">Feedback</h3>
					<input class="search" ng-model="search" placeholder="Search…">
				</div>
				<ul class="feedback-container" ng-class="{semi:$index!=currentIndex}" ng-hide="image.annotations.length == 0" ng-repeat="image in images | filter:search" ng-mouseenter="setImage($index)">
					<div class="clickable feedback-title" ng-mouseenter="disableAnnotationTransition()" ng-mousemove="showAllAnnotations()" ng-mouseleave="hideAllAnnotations()">{{image.filename}}</div>
					<div class="feedback-content">
						<li ng-repeat="annotation in image.annotations | typeFilter:commentTypes | filter:search" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)">
							<h3 class="light">Florian</h3>
							<div class="bubble"><span class="tag" ng-class="{green: annotation.type=='idea', purple:annotation.type=='question', blue: annotation.type=='onit'}">{{annotation.typeLabel}}</span> {{annotation.comment}}<span class="remove" ng-click="removeAnnotation($index)">×</span></div></li>
					</div>
				</ul>
			</aside>
		
			<!-- // end of comments -->
	
	</div>

	<!-- // end of wrap -->

	<input type="file" id="filepicker" multiple uploader>
	<!--
	<canvas id='world'></canvas>
	!-->
</body>
</html>