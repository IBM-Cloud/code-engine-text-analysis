$(document).ready(function () {
  $('.loader-wrapper').addClass('is-active');
  getUploadedImages();
  $("#classifybtn").attr("disabled", true);
  $("#uploadbtn").click(function(e){
    $("#file").click();
    e.preventDefault();
  });
  $("#file").change(function () {
    $("#uploadbtn").submit();
  });
  
  $("#imageForm").submit(function () {
    // // console.log("i am submitted");
    $("#uploadbtn").addClass("is-loading");
    $("#table tbody tr").remove();
    $(this).ajaxSubmit({
      error: function (data) {
        showNotification(data.statusText + ":" + "Check your BACKEND connection to cloud services","is-danger");
        console.log(data);
        $("#uploadbtn").removeClass("is-loading");
        $('.loader-wrapper').removeClass('is-active');
      },
      success: function (response) {
        // // console.log("i am here too");
        // console.log(response.data);
        //$("p.success").text(response.data);
        showNotification(response.data,"is-primary");
        $("#uploadbtn").removeClass("is-loading");
        $("#classifybtn").removeAttr("disabled");
        getUploadedImages();
      },
    });
    return false;
  });

/**
 * Show notification - error, success, info
 *
 * @param {*} data
 * @param {*} cssclass
 */
function showNotification(data,cssclass)
{
  $('.notifications').empty();
  notify(data, cssclass, 7000);
  $(".notification").text(data);
  $(".notification").addClass(cssclass);
  $(".notification").removeClass("is-hidden");
  $(".notification").append('<button class="delete" type="button">Close</button>');
}
  $(".notification").addClass('is-hidden');
  $(document).on('click', '.notification > button.delete', function() {
    $(this).parent().addClass('is-hidden');
    return false;
});
/**
 * Generate a unique identifier for each notification
 *
 * @param {*} len
 * @return {*} 
 */
function stringGen(len) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}
/**
 * Send a notification to the UI with Unique ID
 *
 * @param {*} msg
 * @param {*} mode
 * @param {*} duration
 */
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

/**
 * Delete an image 
 *
 * @param {*} filename
 */
function deleteImage(filename){
  $("#classifybtn").attr("disabled", true);
  $.ajax({
    type: "DELETE",
    url: "/image?filename="+filename,
    success: function (response) {
      showNotification("Image deleted successfully...","is-primary");
    },
    error: function (data) {
     console.log(data);
    }
  });
}
function addClickToDelete(){
  $(".card-content").on("click","a", function (){
    var filename=$(this).attr("id");
    deleteImage(filename);
    getUploadedImages();
    $("#column-multiline").remove($(this).parents(".card"));
  });
  return false;
}

function showJSON(value){
  $('.div-toggle').each(function (index){
     $(this).on("click", function(){
        $(this).parent().siblings(".code-editor").text(value);
        $(this).parent().siblings(".code-editor").toggleClass('is-hidden');
     });

   });
}

/**
 * Toggle the results table
 *
 */
function toggleTable(){
	 $('.table-toggle').each(function (index){
     $(this).on("click", function(){
      	$(this).parent().siblings(".table").toggleClass('is-hidden');
     });

   });
}
/**
 * Read the results from the COS Bucket
 * JSON output post Job run
 *
 */
function readResults(){
  $.ajax({
    type: "POST",
    url: "/classifyimage",
    success: function (response) {
      $("#classifybtn").removeAttr("disabled");
      //console.log(response);
      var data = JSON.parse(response.data);
      var jsonValue = ""; 
      //console.log(data);
      $("p.card-footer-item").each(function (index) {
        console.log( index + ": " + $( this ).text() );
        var id = $(this).attr("id");
        //console.log(id);
        var value = "results/" + id.toString() + ".json";
        //console.log(value);
        //console.log(Object.keys(data).length);
        if (Object.keys(data).length !== 0 && data.hasOwnProperty(value)) {
        var result = data[value].keywords;
        jsonValue = data[value];
        console.log(result);
        let parent = $(this).parent(".card-footer");
        if (result.length > 1) {
             parent.append('<a class="card-footer-item table-toggle">Keywords<span class="icon"><i class="fas fa-angle-down" aria-hidden="true"></i></span></a><br>')
             parent.append('<a class="card-footer-item div-toggle is-pulled-right">JSON&lt;\/&gt;</a><br>')
             parent.after(
              '<table class="table is-striped is-fullwidth is-hidden"><thead><tr><th>Keyword</th><th>Relevance</th><tbody></tbody></table>');
             parent.after(
              '<textarea class="textarea code-editor is-hidden" rows="10" readonly></textarea>');
          for (var i = 0; i < result.length; i++) {
               parent.siblings(".table")
              .children("tbody")
              .append(
                "<tr><td>" +
                  result[i].text +
                  "</td><td>" +
                  result[i].relevance +
                  "</td></tr>"
              );
          }
          parent.siblings(".card-content").children(".tag").text("Classified");
          parent.siblings(".card-content").children("span").toggleClass("is-info");
          $('.loader-wrapper').removeClass('is-active');
        }
        }
        else {
           $('.loader-wrapper').removeClass('is-active');
        }
      });
      toggleTable();
      showJSON(JSON.stringify(jsonValue,null,4));
    },
    error: function (data) {
      //$("p.error").text(data.statusText + ":" + "Check logs for more info");
      console.log(data);
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
/**
 * Get the Uploaded Images from the COS Bucket
 *
 * @return {*} 
 */
function getUploadedImages(){
    // // console.log("I am called");
    $('.loader-wrapper').addClass('is-active');
    $.ajax({
      type: "GET",
      url: "/items",
      success: function (response) {
        $("#column-multiline").empty();
        //console.log(response);
        if(response.data.includes("error") ) {
          showNotification("An error occurred, check your backend connection to cloud services", "is-danger");
          $("#classifybtn").attr("disabled", true);
          $('.loader-wrapper').removeClass('is-active');
          return false;
        }
        var data = JSON.parse(response.data);
        //console.log(data);

        if(Object.keys(data).length === 0) {
          showNotification("Upload an image...", "is-info");
          $('.loader-wrapper').removeClass('is-active');
          return false;
        }
        for (var i = 0; i < Object.keys(data).length; i++) {
          var buffer = Object.values(data)[i];
          var str = atob(buffer).substring(0,150)+"...";
          let fileName = Object.keys(data)[i].split("/")[1];
          $("#column-multiline").append(
            '<div class="column is-one-quarter-desktop is-half-tablet">\
      <div class="card" id="' +
      fileName +
      '-card">\
              <div class="card-content">\
                <span class="tag is-info is-pulled-left">\
                  Not classified\
                </span><a id="' +
                fileName +
                '" class="is-pulled-right"><span class="icon"><i class="fas fa-trash-alt"></i> </span></a> \
                <br>\
    <p class="subtitle">'+ str +' \
    </p>\
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
       let error= data.statusText + ":" + "An error occurred while uploading, check your backend logs.";
         console.log(data);
        showNotification(error, "is-danger");
        $("#classifybtn").attr("disabled", true);
       $('.loader-wrapper').removeClass('is-active');
      }
    });
    return false;
  }
  
});
