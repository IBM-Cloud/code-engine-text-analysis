$(document).ready(function() {
  $("p.error").text("");
  $("#classifybtn").attr("disabled", true);
  $("#file").change(function() {
    showUploadedImage(this);
    $("#classifybtn").removeAttr("disabled");
  });
  $("#imageForm").submit(function() {
    $("#classifybtn").addClass("is-loading");
    $("#table tbody tr").remove();
    $(this).ajaxSubmit({
      error: function(xhr) {
        $("p.error").text(xhr.status);
      },
      success: function(response) {
        $("#classifybtn").removeClass("is-loading");
        $("#classifybtn").attr("disabled", true);
        console.log(response);
      }
    });
    return false;
  });
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

  });
});

// Shows the preview of uploaded image
function showUploadedImage(fileInput) {
  var classifyBtn = document.getElementById("classifybtn");
  var files = fileInput.files;
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var imageType = /image.*/;
      if (!file.type.match(imageType)) {
        continue;
      }
      const fileName = document.querySelector("#file-js-example .file-name");
      fileName.textContent = files[0].name;
      var img = document.getElementById("uploadedimage");
      img.file = file;
      var reader = new FileReader();
      reader.onload = (function(aImg) {
        return function(e) {
          aImg.src = e.target.result;
        };
      })(img);
      reader.readAsDataURL(file);
    }
  }
}
