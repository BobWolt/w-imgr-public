import styles from "./index.css";
import editIcon from "./images/edit.svg";
import imageIcon from "./images/image.svg";
import wimgrLogo from "./images/w-imgr-logo.svg";
import loadIcon from "./images/loader.svg";

$("head").append(`<style>${styles.toString()}</style>`);
$(document).ready(function () {
  console.log("ready");

  const proxy = "https://w-imgr-proxy.herokuapp.com/";

  // state variable to watch active modal
  let activeModal = false;

  // Getting all elements with background-image set
  const backgrElementsObj = $("div").filter(function () {
    return $(this).css("background-image") !== "none";
  });

  const backgrElements = Object.values(backgrElementsObj);

  // Attach buttons to each div that has a backgr-image ccs attribute => assign unique ID to each div and btn
  backgrElements.forEach((div, i) => {
    const uniqueId = i;
    const splashID = `w-imgr_btn-${uniqueId}`;
    const splashBtn = `
          <button id="${splashID}" class="w-imgr_splash_btn">
            <img class="w-imgr_btn_icon" src="${editIcon}" />  
          </button>
        `;
    const className = `.${div.className}`;
    $(className).append(splashBtn);
    $(`#${splashID}`).parent().attr("id", `w-imgr_img-${uniqueId}`);
  });

  // index variable for updating Load More images
  let idIndex = -1;

  const displayImages = function (res, id) {
    const imgArr = res.results;

    // index variable for updating index served into imgArr
    let index = -1;

    imgArr.forEach(() => {
      index++;
      idIndex++;
      const imgSrcThumb = imgArr[index].urls.thumb;
      const imgSrcFull = imgArr[index].urls.full;

      const html = `
        <div class="w-imgr_image_wrapper">
          <div class="w-imgr_unsplash_image" id="w-imgr_unsplash-img-${idIndex}"></div>
          <div class="w-imgr_attribution_wrapper">
            <h5 class="w-imgr_creator_name">Photo by:<a class="w-imgr_attribution_link" target="_blank" href="${imgArr[index].links.html}">&nbsp${imgArr[index].user.name}</a></h5>
            <h5 class="w-imgr_unsplash_link">
              <a href="https://unsplash.com" target="_blank">Unsplash</a>
            </h5>
          </div>
        </div>
        `;
      $(".w-imgr_image_container").append(html);
      $(`#w-imgr_unsplash-img-${idIndex}`).css(
        "background-image",
        `url(${imgSrcThumb})`
      );
      $(`#w-imgr_unsplash-img-${idIndex}`).attr("data", `${imgSrcFull}`);
    });

    // when image is selected load in hd quality image from data attr as background-image
    $(".w-imgr_unsplash_image").click(function () {
      console.log('button id', id)
      $(".w-imgr_image_wrapper_selected").removeClass("w-imgr_image_wrapper_selected");
      $(this).parent().addClass("w-imgr_image_wrapper_selected");
      (async () => {
        const img = new Image();
        img.src = `${$(this).attr("data")}`;

        $(`#w-imgr_btn-${id}`).append(
          $("<div>")
            .addClass("w-imgr_loading_animation")
            .css("background-image", `url(${loadIcon})`)
        );
        $(`#w-imgr_btn-${id}`).append($("<h5>Loading</h5>").addClass("w-imgr_loading_text"));
        await img.decode();
        $(".w-imgr_loading_animation").remove();
        $(".w-imgr_loading_text").remove();
        $(`#w-imgr_img-${id}`).css("background-image", `url(${$(this).attr("data")}`);
        // img is ready to use
        console.log(`width: ${img.width}, height: ${img.height}`);
      })();
    });
    index = -1;
  };

  let pageNumber = 1;
  // Get images on search query
  const loadImages = async function (query, id) {
    console.log("pagenumber", pageNumber);
    let getImages = await fetch(
      `${proxy}https://api.unsplash.com/search/photos?&page=${pageNumber}&per_page=30&query=${query}>`,
      {
        method: "GET",
        headers: { query: query, page: pageNumber },
      }
    );

    let res = await getImages.json();
    console.log("response", res);

    displayImages(res, id);
    console.log("images amount: ", $(".w-imgr_unsplash_image").length);
    pageNumber++;
  };

  // closing the modal
  const closeModalLogic = function () {
    pageNumber = 1;
    $(".w-imgr_modal_wrapper").removeClass("w-imgr_modal_animation");
    $(".w-imgr_modal_wrapper").addClass("w-imgr_modal_animation_remove");
    activeModal = false;
    setTimeout(function () {
      $(".w-imgr_modal_wrapper").remove();
    }, 800);
  };

  // To attach to close btn on creation of modal
  const closeModal = function () {
    $(".w-imgr_close_modal_btn").click(function () {
      closeModalLogic();
    });
  };

  // opening the modal
  const openModal = function (btn) {
    console.log("clicked", btn);
    activeModal = true;
    const splashID = $(btn).attr("id").split("btn-")[1];
    console.log(btn.parent());
    const modal = `
      <div class="w-imgr_modal_wrapper w-imgr_modal_animation">
        <div class="w-imgr_modal_header_wrapper">
          <img class="w-imgr_logo" src="${wimgrLogo}">
          <h4 class="w-imgr_current_el">Editing: ${
            btn.parent()[0].className
          }</h4>
          <div class="w-imgr_modal_controls_wrapper">
            <button class="w-imgr_close_modal_btn">Close</button>
          </div>
        </div>
        <div class="form_wrapper">
          <form id="w-imgr_form-image-search">
            <input
              class="w-imgr_search_bar"
              type="text"
              placeholder="Search for images"
            />
          </form>
        </div>
        <div class="w-imgr_image_container"></div>
        <div class="w-imgr_more_btn_wrapper"></div>
      </div>
      `;
    $("body").append(modal);
    $(".w-imgr_search_bar").focus();
    $("#w-imgr_form-image-search").submit(function (e) {
      e.preventDefault();
      loadImages($(".w-imgr_search_bar").val(), splashID);
      $(".w-imgr_more_btn").css("display", "flex");
    });

    const moreBtnHtml = `<button class="w-imgr_more_btn w-imgr_small_btn"><img class="w-imgr_btn_icon w-imgr_btn_icon_margin" src="${imageIcon}" />Load more</button>`;
    $(".w-imgr_more_btn_wrapper").append(moreBtnHtml);
    $(".w-imgr_more_btn").click(function () {
      loadImages($(".w-imgr_search_bar").val(), splashID);
    });

    closeModal();
  };

  // when other w-imgr btn is pressed modal closes and removed, and new modal is created
  $(".w-imgr_splash_btn").click(function () {
    const currentBtn = $(this);
    if (activeModal) {
      closeModalLogic();
      setTimeout(function () {
        openModal(currentBtn);
      }, 800);
    } else {
      openModal(currentBtn);
      console.log(editIcon);
    }
  });
});
