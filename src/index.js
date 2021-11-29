import styles from "./index.css";
import editIcon from "./images/edit.svg";
import imageIcon from "./images/image.svg";
import wimgrLogo from "./images/w-imgr-logo.svg";
import loadIcon from "./images/loader.svg";
import closeIcon from "./images/x.svg";
import searchIcon from "./images/search.svg";

// get request needed to trigger image download counter MANDATORY for unsplash API usage
const downloadTrigger = async function (url) {
  let downloadImage = await fetch(`${proxy}${imageURL}`, {
    method: "GET",
  });

  let res = await downloadImage.json();
  console.log("DOWNLOAD API RES", res);
};

$("head").append(`<style>${styles.toString()}</style>`);
$(document).ready(function () {
  console.log("ready");

  const proxy = "https://w-imgr-proxy.herokuapp.com/";

  // state variable to watch active modal
  let activeModal = false;
  let activeSearch = false;

  // index variable for updating Load More images
  let idIndex = -1;

  const displayImages = function (res) {
    const imgArr = res.results;

    $(".w-imgr_search_bar").css("margin-bottom", "16px");
    $(".w-imgr_image_container").css("opacity", "1");

    // index variable for updating index served into imgArr
    let index = -1;

    imgArr.forEach(() => {
      index++;
      idIndex++;
      const imgSrcThumb = imgArr[index].urls.thumb;
      const imgSrcSmall = imgArr[index].urls.small;
      const imgSrcFull = imgArr[index].urls.full;

      const html = `
        <div class="w-imgr_image_wrapper">
              <div class="w-imgr_unsplash_image" id="w-imgr_unsplash-img-${idIndex}">
                <div class="w-imgr_attribution_wrapper">
                  <h5 class="w-imgr_creator_name">Photo by:  
                    <a class="w-imgr_attribution_link" target="_blank" href="${imgArr[index].user.links.html}?utm_source=w-imgr&utm_medium=referral" >${imgArr[index].user.name}</a>
                  </h5>
                  <h5 class="w-imgr_unsplash_link">
                    <a class="w-imgr_attribution_link" href="https://unsplash.com?utm_source=w-imgr&utm_medium=referral" target="_blank">Unsplash</a>
                  </h5>
                </div>
              </div>
            </div>
        `;

      $(".w-imgr_image_container").append(html);
      $(`#w-imgr_unsplash-img-${idIndex}`).css(
        "background-image",
        `url(${imgSrcSmall})`
      );
      $(`#w-imgr_unsplash-img-${idIndex}`).attr("data", `${imgSrcFull}`);
    });

    // when image is selected load in hd quality image from data attr as background-image
    $(".w-imgr_unsplash_image").click(function () {
      const imageLink = $(this).attr("data");
      $("#w-imgr_form_input").val(imageLink);

      $(".w-imgr_image_wrapper_selected").removeClass(
        "w-imgr_image_wrapper_selected"
      );
      $(this).parent().addClass("w-imgr_image_wrapper_selected");
      (async () => {
        const img = new Image();
        img.src = `${$(this).attr("data")}`;

        $(`#w-imgr_preview_image`).append(
          $("<div>")
            .addClass("w-imgr_loading_animation")
            .css("background-image", `url(${loadIcon})`)
        );
        $(`#w-imgr_preview_image`).append(
          $("<h5>Loading</h5>").addClass("w-imgr_loading_text")
        );
        await img.decode();
        $(".w-imgr_loading_animation").remove();
        $(".w-imgr_loading_text").remove();
        $(`#w-imgr_preview_image`).css(
          "background-image",
          `url(${$(this).attr("data")}`
        );
      })();
      $("#w-imgr_remove_btn").css("display", "block");
    });

    index = -1;
  };

  let pageNumber = 1;
  // Get images on search query
  const loadImages = async function (query) {
    console.log("pagenumber", pageNumber);
    let getImages = await fetch(
      `${proxy}https://api.unsplash.com/search/photos?&orientation=landscape&page=${pageNumber}&per_page=30&query=${query}>`,
      {
        method: "GET",
        headers: { query: query, page: pageNumber },
      }
    );

    let res = await getImages.json();
    console.log("response", res);

    displayImages(res);
    console.log("images amount: ", $(".w-imgr_unsplash_image").length);
    pageNumber++;
  };

  // closing the modal
  const closeModalLogic = function () {
    pageNumber = 1;
    $(".w-imgr_more_btn").css("display", "none");
    $(".w-imgr_modal_wrapper").removeClass("w-imgr_modal_animation");
    $(".w-imgr_modal_wrapper").addClass("w-imgr_modal_animation_remove");
    //activeModal = false;
    setTimeout(function () {
      $(".w-imgr_modal_wrapper").css("display", "none");
      $(".w-imgr_modal_wrapper").removeClass("w-imgr_modal_animation_remove");
      $(".w-imgr_image_container").remove();
      $(".w-imgr_search_bar").val("");
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
    activeModal = true;
    //const splashID = $(btn).attr("id").split("btn-")[1];
    const modal = `
      <div class="w-imgr_modal_wrapper w-imgr_modal_animation">
        <div class="w-imgr_modal_header_wrapper">
          <div class="w-imgr_heading_wrapper">
            <img class="w-imgr_search_icon" src="${searchIcon}">
            <h2 class="w-imgr_heading_title">Zoek voor een afbeelding</h2>
          </div>
          <div class="w-imgr_modal_controls_wrapper">
            <button class="w-imgr_close_modal_btn" style="background-image: url(${closeIcon})"></button>
          </div>
        </div>
        <div class="w-imgr_form_wrapper">
          <form id="w-imgr_form-image-search">
            <input
              class="w-imgr_search_bar"
              type="text"
              placeholder="bijv. 'Neighbourhood'"
            />
          </form>
        </div>
        <div class="w-imgr_image_container"></div>
        <div class="w-imgr_more_btn_wrapper"></div>
        <div class="w-imgr_poweredby_wrapper">
            <h5 class="w-imgr_poweredby_heading">Powered by:</h5>
            <img class="w-imgr_logo" src="${wimgrLogo}">
          </div>
      </div>
      `;
    $("body").append(modal);
    $(".w-imgr_search_bar").focus();
    $("#w-imgr_form-image-search").submit(function (e) {
      e.preventDefault();
      if (!activeSearch) {
        activeSearch = true;
        loadImages($(".w-imgr_search_bar").val());
        $(".w-imgr_more_btn").css("display", "flex");
      } else if (activeSearch) {
        pageNumber = 1;
        $(".w-imgr_image_container").remove();
        createImgContainer();
        loadImages($(".w-imgr_search_bar").val());
      }
    });

    const moreBtnHtml = `<button class="w-imgr_more_btn w-imgr_small_btn"><img class="w-imgr_btn_icon w-imgr_btn_icon_margin" src="${imageIcon}" />Meer afbeeldingen</button>`;
    $(".w-imgr_more_btn_wrapper").append(moreBtnHtml);
    $(".w-imgr_more_btn").click(function () {
      loadImages($(".w-imgr_search_bar").val());
    });

    closeModal();
  };

  const createImgContainer = function () {
    const imageContainer = `<div class="w-imgr_image_container"></div>`;
    //$(".w-imgr_modal_wrapper").append(imageContainer);
    $(imageContainer).insertAfter(".w-imgr_form_wrapper");
  };

  const reOpenModal = function () {
    $(".w-imgr_search_bar").focus();
    $(".w-imgr_modal_wrapper").css("display", "flex");
    $(".w-imgr_modal_wrapper").addClass("w-imgr_modal_animation");
    createImgContainer();
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
  $("#w-imgr_start_btn").click(function () {
    if (!activeModal) {
      openModal();
    } else if (activeModal) {
      reOpenModal();
    }
  });

  $("#w-imgr_remove_btn").click(function () {
    $("#w-imgr_form_input").val("");
    $("#w-imgr_preview_image").css("background-image", "");
    $(this).css("display", "none");
  });
});

// UPCOMING FIXES
// Load more btn => dutch
// image container styling
// mobile styling
// on new search remove current image container and replace with new one
