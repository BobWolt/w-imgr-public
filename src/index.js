import styles from "./index.css";
import editIcon from "./images/edit.svg";
import imageIcon from "./images/image.svg";
import wimgrLogo from "./images/w-imgr-logo.svg";
import loadIcon from "./images/loader.svg";
import downloadIcon from "./images/download.svg";
const JSZipUtils = require("jszip-utils");

// get request needed to trigger image download counter MANDATORY for unsplash API usage
const downloadTrigger = async function () {
  let getImages = await fetch(
    `https://api.unsplash.com/photos/IFxjDdqK_0U/download?ixid=MnwyNzU4MDl8MHwxfHNlYXJjaHwxfHxjYXQlM0V8ZW58MHx8fHwxNjM3NTczNDU5`,
    {
      method: "GET",
      headers: {
        Authorization: "Client-ID cNlSmrvPU2c8D2g26mR8gtxLY5h0Z6WCcTBmbAsPW0Y",
      },
    }
  );

  let res = await getImages.json();
  console.log("DOWNLOAD API RES", res);
};

const favoriteDownload = async function (imageURL) {
  let getImages = await fetch(`${proxy}${imageURL}`, {
    method: "GET",
    headers: {
      Authorization: "Client-ID cNlSmrvPU2c8D2g26mR8gtxLY5h0Z6WCcTBmbAsPW0Y",
    },
  });

  let res = await getImages.json();
  console.log("favorite download", res);
};

const starIcon = `<svg
xmlns="http://www.w3.org/2000/svg"
class="w-imgr_favorite"
viewBox="0 0 512 512"
>
<title>Star</title>
<path
  d="M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"
/>
</svg>`;

const JSZip = require("jszip");
const FileSaver = require("file-saver");

// when downloading, filter out unique values of arr only so that the zip file contains only one image per file
let favoriteImages = [];

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
  console.log("backgr els: ", backgrElements);

  // Attach buttons to each div that has a backgr-image ccs attribute => assign unique ID to each div and btn
  backgrElements.forEach((div, i) => {
    const uniqueId = i;
    const splashID = `w-imgr_btn-${uniqueId}`;
    const splashBtn = `
          <button id="${splashID}" class="w-imgr_splash_btn">
            <img class="w-imgr_btn_icon" src="${editIcon}" />  
          </button>
        `;

    if (div.className) {
      $(div).attr("id", `w-imgr_img-${uniqueId}`);
    } else {
      return false;
    }

    $(`#w-imgr_img-${uniqueId}`).append(splashBtn);

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
      const imgSrcSmall = imgArr[index].urls.small;
      const imgSrcFull = imgArr[index].urls.full;

      const html = `
        <div class="w-imgr_image_wrapper">
              <div class="w-imgr_unsplash_image" id="w-imgr_unsplash-img-${idIndex}">
                <div class="w-imgr_favorite_wrapper">
                  <div class="w-imgr_favorite_btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-imgr_favorite"
                      viewBox="0 0 512 512"
                    >
                      <title>Star</title>
                      <path
                        d="M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="w-imgr_attribution_wrapper">
                  <h5 class="w-imgr_creator_name">Photo by:  
                    <a class="w-imgr_attribution_link" target="_blank" href="${imgArr[index].user.links.html}?utm_source=w-imgr&utm_medium=referral" >${imgArr[index].user.name}</a>
                  </h5>
                  <h5 class="w-imgr_unsplash_link">
                    <a href="https://unsplash.com?utm_source=w-imgr&utm_medium=referral" target="_blank">Unsplash</a>
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
      console.log("button id", id);
      $(".w-imgr_image_wrapper_selected").removeClass(
        "w-imgr_image_wrapper_selected"
      );
      $(this).parent().addClass("w-imgr_image_wrapper_selected");
      (async () => {
        const img = new Image();
        img.src = `${$(this).attr("data")}`;

        $(`#w-imgr_btn-${id}`).append(
          $("<div>")
            .addClass("w-imgr_loading_animation")
            .css("background-image", `url(${loadIcon})`)
        );
        $(`#w-imgr_btn-${id}`).append(
          $("<h5>Loading</h5>").addClass("w-imgr_loading_text")
        );
        await img.decode();
        $(".w-imgr_loading_animation").remove();
        $(".w-imgr_loading_text").remove();
        $(`#w-imgr_img-${id}`).css(
          "background-image",
          `url(${$(this).attr("data")}`
        );
      })();
    });

    $(".w-imgr_favorite_btn").click(function (e) {
      e.stopPropagation();
      const imgSrc = $(this).parents(".w-imgr_unsplash_image").attr("data");

      if (!$(this).hasClass("w-imgr_isfavorite_btn")) {
        $(this).addClass("w-imgr_isfavorite_btn");
        $(this).children(".w-imgr_favorite").addClass("w-imgr_isfavorite");
        favoriteImages.push(imgSrc);
      } else {
        $(this).removeClass("w-imgr_isfavorite_btn");
        $(this).children(".w-imgr_favorite").removeClass("w-imgr_isfavorite");
        favoriteImages.splice(favoriteImages.indexOf(imgSrc), 1);
      }
    });

    // Check for previously favorited images and toggle correct classes
    favoriteImages.forEach((imgSrc) => {
      $(".w-imgr_unsplash_image").each(function () {
        if ($(this).attr("data") === imgSrc) {
          $(this)
            .find(".w-imgr_favorite_btn")
            .addClass("w-imgr_isfavorite_btn");
          $(this).find("svg").addClass("w-imgr_isfavorite");
        }
      });
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
    const modal = `
      <div class="w-imgr_modal_wrapper w-imgr_modal_animation">
        <div class="w-imgr_modal_header_wrapper">
          <img class="w-imgr_logo" src="${wimgrLogo}">
          <div class="w-imgr_download_wrapper">
            <button class="w-imgr_download_btn"><img src="${downloadIcon}"> Download as .ZIP</button>
            <div class="w-imgr_progress_bar_wrapper w-imgr_progress_bar_hide">
              <div class="w-imgr_progress_bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
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
    $(".w-imgr_download_btn").click(function () {
      downloadZIP();
    });
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
  //$(".w-imgr_favorite").css("background-image", `url("${favoriteIcon}")`);
});

// .ZIP logic

const downloadZIP = function () {
  console.log("download btn clicked");

  const Promise = window.Promise;
  if (!Promise) {
    Promise = JSZip.external.Promise;
  }

  /**
   * Fetch the content and return the associated promise.
   * @param {String} url the url of the content to fetch.
   * @return {Promise} the promise containing the data.
   */
  function urlToPromise(url) {
    return new Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  const zip = new JSZip();

  // find every checked item
  favoriteImages.forEach((image) => {
    //var filename = image.replace(/.*\//g, "");
    const filename = `${image}.jpg`;
    zip.file(filename, urlToPromise(image), { binary: true });
  });

  // when everything has been downloaded => trigger download
  zip
    .generateAsync({ type: "blob" }, function updateCallback(metadata) {
      let msg = "progression : " + metadata.percent.toFixed(2) + " %";
      if (metadata.currentFile) {
        msg += ", current file = " + metadata.currentFile;
      }
      console.log(msg);
      function updatePercent(percent) {
        $(".w-imgr_progress_bar_wrapper").removeClass(
          "w-imgr_progress_bar_hide"
        );
        $(".w-imgr_progress_bar_wrapper")
          .children(".w-imgr_progress_bar")
          .attr("aria-valuenow", percent)
          .css("width", percent + "%");
        console.log("update percent", percent);
      }
      updatePercent(metadata.percent | 0);
    })
    .then(function callback(blob) {
      saveAs(blob, "example.zip");
    });

  return false;
};
