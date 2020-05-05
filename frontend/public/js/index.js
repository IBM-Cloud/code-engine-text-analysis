$(document).ready(function () {
  $("p.error").text("");
  $("p.success").text("");
  $("#uploadbtn").attr("disabled", true);
  $("#file").change(function () {
    $("#column-multiline").empty();
    showUploadedImage(this);
    $("#uploadbtn").removeAttr("disabled");
  });
  $("#imageForm").submit(function () {
    $("#uploadbtn").addClass("is-loading");
    $("#table tbody tr").remove();
    $(this).ajaxSubmit({
      error: function (data) {
        $("p.error").text(data.statusText + ":" + "Check your BACKEND URL");
        $("#uploadbtn").removeClass("is-loading");
        $("#uploadbtn").attr("disabled", true);
      },
      success: function (response) {
        console.log(response.data);
        $("p.success").text(response.data);
        $("#uploadbtn").removeClass("is-loading");
        $("#uploadbtn").attr("disabled", true);
      },
    });
    return false;
  });
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // Shows the preview of uploaded image
  function showUploadedImage(fileInput) {
    var uploadbtn = document.getElementById("uploadbtn");
    var files = fileInput.files;
    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
          continue;
        }
        $("#column-multiline").append(
          '<div class="column is-one-half-desktop is-half-tablet">\
                  <div class="card">\
                      <div class="card-image">\
                          <figure class="image is-3by2">\
                            <img id="uploadedimg' +
            i +
            '" src="https://unsplash.it/300/200/?random&pic=1" alt="placeholder">\
                          </figure>\
                          <div class="card-content is-overlay">\
                            <span class="tag is-info is-pulled-right">\
                              Not Analyzed\
                            </span>\
                          </div>\
                      </div>\
                      <footer class="card-footer">\
                          <a class="card-footer-item">\
                            RESULT\
                          </a>\
                      </footer>\
                  </div>\
                </div>'
        );
        //const fileName = document.querySelector("#file-js-example .file-name");
        //files[i].name = 'image_'+i-1+file.type;
        var img = document.getElementById("uploadedimg" + i);
        img.file = file;
        var reader = new FileReader();
        reader.onload = (function (aImg) {
          return function (e) {
            aImg.src = e.target.result;
          };
        })(img);
        reader.readAsDataURL(file);
      }
    }
  }
});
