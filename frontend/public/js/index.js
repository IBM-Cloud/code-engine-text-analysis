$(document).ready(function () {
  $('.loader-wrapper').addClass('is-active');
  getUploadedImages();
  $("p.error").text("");
  $("p.success").text("");
  
  $("#uploadbtn").click(function(e){
    $("#file").click();
    e.preventDefault();
  });
  $("#file").change(function () {
    //$("#column-multiline").empty();
   // showUploadedImage(this);
    //$("#uploadbtn").removeAttr("disabled");
    $("#uploadbtn").submit();
    console.log("i am here");
  });
  
  $("#imageForm").submit(function () {
    console.log("i am submitted");
    $("#uploadbtn").addClass("is-loading");
    $("#table tbody tr").remove();
    $(this).ajaxSubmit({
      error: function (data) {
        showNotification(data.statusText + ":" + "Check your BACKEND URL","is-danger");
        $("#uploadbtn").removeClass("is-loading");
      },
      success: function (response) {
        console.log("i am here too");
        console.log(response.data);
        //$("p.success").text(response.data);
        showNotification(response.data,"is-primary");
        $("#uploadbtn").removeClass("is-loading");
        $("#classifybtn").removeAttr("disabled");
        getUploadedImages();
      },
    });
    return false;
  });

/***************************************
*********NOTIFICATIONS****************
***************************************/
function showNotification(data,cssclass)
{
  notify(data, cssclass, 5000);
  $(".notification").text(data);
  $(".notification").addClass(cssclass);
  $(".notification").removeClass("is-hidden");
  //$(".notification").append('<button class="delete" type="button">Close</button>');
}

  $(".notification").addClass('is-hidden');
  $(document).on('click', '.notification > button.delete', function() {
    $(this).parent().addClass('is-hidden');
    return false;
});

function stringGen(len) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}

function notify(msg, mode, duration) {
  var classy = stringGen(9);
  $('.notifications').append(`<div id='${classy}' class='notification ${mode} slideInRight'>${msg}</div>`)
  $('.notification').click(function() {
    $(this).removeClass('slideInRight');
    $(this).addClass('slideOutRight');
    setTimeout(function() {
      $(this).remove();
    }, 350);
  });
  setTimeout(function() {
    $(`#${classy}`).removeClass('slideInRight');
    $(`#${classy}`).addClass('slideOutRight');
    setTimeout(function() {
      $(`#${classy}`).remove();
    }, 350);
  }, duration);
}

/* DELETE functionality*/
function deleteImage(filename){
  $.ajax({
    type: "DELETE",
    url: "/image?filename="+filename,
    success: function (response) {
      showNotification("Image deleted!!!","is-primary");
    },
    error: function (data) {
      $("p.error").text(
        data.statusText + ":" + "Check logs for more info"
      );
    }
  });
}
function addClickToDelete(){
  $(".card-content").on("click","a", function (){
    console.log("Clicked!!")
    var filename=$(this).attr("id");
    deleteImage(filename);
    getUploadedImages();
    $("#column-multiline").remove($(this).parents(".card"));
  });
  return false;
}

function toggleTable(){
  console.log("toggled!");
	 $('.table-toggle').each(function (index){
     $(this).on("click", function(){
      	$(this).parent().siblings(".table").toggleClass('is-hidden');
     });

   });
}

function readResults(){
  $.ajax({
    type: "POST",
    url: "/classifyimage",
    success: function (response) {
      console.log(response);
      var data = JSON.parse(response.data);
      console.log(data);
      //var matched = $("#column-multiline footer").length;
      $("p.card-footer-item").each(function (index) {
        //console.log( index + ": " + $( this ).text() );
        var id = $(this).attr("id");
        //console.log(id);
        var value = "results/" + id.toString() + ".json";
        //console.log(value);
        console.log(Object.keys(data).length);
        if (Object.keys(data).length !== 0 && data[value] !== undefined) {
        var result = data[value].images[0].classifiers[0].classes.sort(
          function (a, b) {
            return b.score - a.score;
          }
        );
        console.log(result);
        let parent = $(this).parent(".card-footer");
        if (result.length > 1) {
             parent.append('<a href="#" class="card-footer-item table-toggle is-pulled-right">show results<span class="icon"><i class="fas fa-angle-down" aria-hidden="true"></i></span></a><br>')
             parent.after(
              '<table class="table is-striped is-fullwidth is-hidden"><tbody></tbody></table>');

          for (var i = 0; i < result.length; i++) {
               parent.siblings(".table")
              .children("tbody")
              .append(
                "<tr><td>" +
                  result[i].class +
                  "</td><td>" +
                  result[i].score +
                  "</td></tr>"
              );
          }
          parent.siblings().children(".card-content").children(".tag").text("Classified");
          parent.siblings().children(".card-content").children("span").toggleClass("is-info");
          $('.loader-wrapper').removeClass('is-active');
        }
        }
      });
      toggleTable();
      $('.loader-wrapper').removeClass('is-active');
    },
    error: function (data) {
      $("p.error").text(data.statusText + ":" + "Check logs for more info");
      $("#classifybtn").attr("disabled", true);
      $('.loader-wrapper').removeClass('is-active');
    },
  });
}
  $("#classifybtn").click(function () {
    $("#classifybtn").attr("disabled", true);
    $(".tag").text("classifying...");
    getUploadedImages();
  });

  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  function getUploadedImages(){
    console.log("I am called");
    $('.loader-wrapper').addClass('is-active');
    $.ajax({
      type: "GET",
      url: "/items",
      success: function (response) {
        $("#column-multiline").empty();
        console.log(response);
        if(response.data.includes("error") ) {
          showNotification("An error occurred, check your backend.", "is-danger");
          $('.loader-wrapper').removeClass('is-active');
          return false;
        }
        var data = JSON.parse(response.data);
        console.log(data);

        if(Object.keys(data).length === 0) {
          $('.loader-wrapper').removeClass('is-active');
          return false;
        }
        //var matched = $("#column-multiline footer").length;
        //var imageElem = document.createElement('img');
        // Just use the toString() method from your buffer instance
        // to get date as base64 type
        //imageElem.src = 'data:image/jpeg;base64,' + buf.toString('base64');
        console.log(Object.keys(data).length);
        for (var i = 0; i < Object.keys(data).length; i++) {
          var buffer = Object.values(data)[i];
          console.log(buffer);
          let fileName = Object.keys(data)[i].split("/")[1];
          $("#column-multiline").append(
            '<div class="column is-one-quarter-desktop is-half-tablet">\
      <div class="card" id="' +
      fileName +
      '-card">\
          <div class="card-image">\
              <figure class="image is-4by3">\
                <img id="' +
              fileName +
              '" src="data:image/jpeg;base64,' +
              buffer +
              '" alt="placeholder">\
              </figure>\
              <div class="card-content is-overlay">\
                <span class="tag is-info is-pulled-left">\
                  Not classified\
                </span><a href="#" id="' +
                fileName +
                '" class="is-pulled-right"><span class="icon"><i class="fas fa-trash-alt"></i> </span></a> \
              </div>\
          </div>\
          <footer class="card-footer">\
              <p id="' +
              fileName +
              '"class="card-footer-item">\
                ' +
              fileName +
              "\
              </p>  \
              \
          </footer>\
      </div>\
    </div>"
          );
        }
        addClickToDelete();
        readResults();
      },
      error: function (data) {
       let error= data.statusText + ":" + "Check your BACKEND URL";
        showNotification(error, "is-danger");
      }
    });
    return false;
  }

  
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
                              Not classified\
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
