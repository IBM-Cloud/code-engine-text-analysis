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
  $("#analyzebtn").removeAttr("disabled");
  $("#analyzebtn").click(function () {
    console.log("Button Clicked");
    $.ajax({
      type: "POST",
      url: "/analyzeimage",
      success: function (response) {
        //console.log(response.data);
        var data = JSON.parse(response.data);
        //console.log(data);
        //var matched = $("#column-multiline footer").length;
        $("p.card-footer-item").each(function(index) {
          //console.log( index + ": " + $( this ).text() );
          var id = $(this).attr("id");
          //console.log(id);
          var value = "results/"+id.toString()+".json";
          //console.log(value);
          //console.log(data[value]);
          var result = data[value].images[0].classifiers[0].classes.sort(function (
          a,
          b
        ) {
          return b.score - a.score;
        });
        console.log(result);
        if(result.length > 1)
        {
          $(this).parent(".card-footer").append('<table class="table is-striped is-fullwidth"><tbody></tbody></table>');

          for(var i=0; i<result.length ;i++)
          {
            $(this).parent(".card-footer").children(".table").children("tbody").append('<tr><td>'+result[i].class+'</td><td>'+result[i].score+'</td></tr>');
          }
          $(this).remove();
        }
        });
      
      },
    });
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
                            <img id="' +
            file.name +
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
                          <p id="' +
            file.name +
            '"class="card-footer-item">\
                            ' +
            file.name +
            "\
                          </p>\
                      </footer>\
                  </div>\
                </div>"
        );
        //const fileName = document.querySelector("#file-js-example .file-name");
        //files[i].name = 'image_'+i-1+file.type;
        var img = document.getElementById(file.name + i);
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
