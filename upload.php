<?php
$path = $_POST["path"];
$fileName = $_FILES['file']['name'];
$fileContent = $_FILES["file"]["tmp_name"];
move_uploaded_file($_FILES['file']['tmp_name'], $path."/".$fileName);
?>