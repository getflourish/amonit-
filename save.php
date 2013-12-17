<?php
	$path = $_GET["path"];
	$postdata = file_get_contents("php://input");
	file_put_contents($path."/data.json", $postdata);
?>
