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
	<div id="mouseTracker"><div ng-hide="cursor.id==me.id" ng-repeat="cursor in cursors" cursor style="position: absolute;width:10px; height: 10px; background: #ff0000; z-index: 2000"></div></div>

	<!-- header -->

	<header>
		<span class="logo space"><em>I’m</em> on it<a class="inset" href="/amonit2/{{data.path}}">amonit.io/{{data.path}}</a></span>
		<span class="space"><span class="icon grey before">U</span><span class="light">Hello,&nbsp;</span><strong>Florian!</strong></span>
		<span class="space"><span class="icon grey before">E</span><span class="light">On it now:&nbsp;</span><strong>Mladen, Isabel</strong></span>
		<div class="center" ng-show="false">
			<h5 ng-show="images.length!=0">{{images[currentIndex-1].filename}}</h5>
			<h4 ng-show="images.length!=0" click-to-edit="current.filename">{{current.filename}}</h4>
			<h5 ng-show="images.length!=0">{{images[currentIndex+1].filename}}</h5>
		</div>
		<div class="right">
			<span class="space"><span class="icon grey before">b</span><strong class="light">Make a new one</strong></span>	
			<span class="space"><span class="icon grey before">G</span><strong class="light">Invite others<strong></span>	
			<span class="space"><span class="icon grey before">`</span><strong class="light">Present (P)<strong></span>	
		</div>
		<div class="user" ng-show="false">
			Moderator: <strong>Florian Schulz</strong><br>
			Viewing: 

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

	</header>

	<!-- // end of header -->

	<div imagedrop id="dropzone" on-image-drop="imageDropped()"><h1 center>Drop Images to Upload</h1></div>

	<!-- wrap -->

	<div id="wrap">

		<!-- sidebar -->
	
		<aside id="left" class="animated" selectedscroll>
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
	
		<!-- Comments -->
	
		<aside id="right" ng-hide="images.length == 0">
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
	
		<!-- main -->
	
		<div id="main">
			<div class="emptystate" ng-show="images.length == 0"><h2>Drag & Drop Images Here</h2></div>
			<div ng-hide="currentIndex == -1" id="imgwrapper">
				<img annotatable ng-src="{{current.path}}" class="current-screen" ng-keypress="setActive(-1)" ng-click="addAnnotation($event.offsetX, $event.offsetY)" />
				<div draggable handle=".handle" annotation ng-repeat="annotation in current.annotations" ng-if="imageLoaded" class="circle note" ng-class="{animate:$index!=selectedAnnotation, large:$index==selectedAnnotation}" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)" annotationid="{{$index}}"><div ng-class="{pulsegreen:annotation.type=='idea', pulseblue:annotation.type=='onit', pulsepurple:annotation.type=='question'}" class="handle"></div>
				<span class="tooltip" ng-class="{open: $index==selectedAnnotation || showingAll}" ng-keydown="blurTooltip($event, $index)" a="annotation" id="$index" types="commentTypes" tooltip>
			</div>
		</div>
	
		<!-- // end of main -->
	
	</div>

	<!-- // end of wrap -->

	<input type="file" id="filepicker" multiple uploader>
	<!--
	<canvas id='world'></canvas>
	!-->
</body>
</html>