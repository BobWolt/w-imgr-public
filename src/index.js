import styles from "./index.css";

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
  backgrElements.forEach((div) => {
    const uniqueId = Math.floor(Math.random() * backgrElements.length);
    const splashID = `btn-${uniqueId}`;
    const splashBtn = `
          <button id="${splashID}" class="splash_btn">
            <img class="btn_icon" src="./images/edit.svg" />
          </button>
        `;
    const className = `.${div.className}`;
    $(className).append(splashBtn);
    $(`#${splashID}`).parent().attr("id", `img-${uniqueId}`);
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
      console.log("idindex", idIndex);

      const html = `
        <div class="image_wrapper">
          <div class="unsplash_image" id="unsplash-img-${idIndex}"></div>
          <div class="attribution_wrapper">
            <h5 class="creator_name">Photo by:<a class="attribution_link" target="_blank" href="${imgArr[index].links.html}">&nbsp${imgArr[index].user.name}</a></h5>
            <h5 class="unsplash_link">
              <a href="https://unsplash.com" target="_blank">Unsplash</a>
            </h5>
          </div>
        </div>
        `;
      $(".image_container").append(html);
      $(`#unsplash-img-${idIndex}`).css(
        "background-image",
        `url(${imgSrcThumb})`
      );
      $(`#unsplash-img-${idIndex}`).attr("data", `${imgSrcFull}`);
    });

    // when image is selected load in hd quality image from data attr as background-image
    $(".unsplash_image").click(function () {
      $(".image_wrapper_selected").removeClass("image_wrapper_selected");
      $(this).parent().addClass("image_wrapper_selected");
      (async () => {
        const img = new Image();
        img.src = `${$(this).attr("data")}`;

        $(`#btn-${id}`).append($("<div>").addClass("w-imgr_loading_animation"));
        $(`#btn-${id}`).append($("<h5>Loading</h5>").addClass("loading_text"));
        await img.decode();
        $(".w-imgr_loading_animation").remove();
        $(".loading_text").remove();
        $(`#img-${id}`).css("background-image", `url(${$(this).attr("data")}`);
        // img is ready to use
        console.log(`width: ${img.width}, height: ${img.height}`);
      })();
    });
    index = -1;
  };

  /* const call = async function () {
      let testCall = await fetch("/api/unsplash", {
        method: "GET",
      });
      let testRes = await testCall.text();
      console.log(testRes);
    };
    call(); */

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
    console.log("images amount: ", $(".unsplash_image").length);
    pageNumber++;
  };

  // closing the modal
  const closeModalLogic = function () {
    pageNumber = 1;
    $(".modal_wrapper").removeClass("modal_animation");
    $(".modal_wrapper").addClass("modal_animation_remove");
    activeModal = false;
    setTimeout(function () {
      $(".modal_wrapper").remove();
    }, 800);
  };

  // To attach to close btn on creation of modal
  const closeModal = function () {
    $(".close_modal_btn").click(function () {
      closeModalLogic();
    });
  };

  // opening the modal
  const openModal = function (btn) {
    console.log("clicked", btn);
    activeModal = true;
    const splashID = $(btn).attr("id").slice(4);
    console.log(btn.parent());
    const modal = `
      <div class="modal_wrapper modal_animation">
        <div class="modal_header_wrapper">
          <img class="w-imgr_logo" src="./images/w-imgr-logo.svg">
          <h4 class="w-imgr_current_el">Editing: ${
            btn.parent()[0].className
          }</h4>
          <div class="w-imgr_modal_controls_wrapper">
            <button class="close_modal_btn">Close</button>
          </div>
        </div>
        <div class="form_wrapper">
          <form id="form-image-search">
            <input
              class="search_bar"
              type="text"
              placeholder="Search for images"
            />
          </form>
        </div>
        <div class="image_container"></div>
        <div class="more_btn_wrapper"></div>
      </div>
      `;
    $("body").append(modal);
    $(".search_bar").focus();
    $("#form-image-search").submit(function (e) {
      e.preventDefault();
      loadImages($(".search_bar").val(), splashID);
      $(".more_btn").css("display", "flex");
    });

    const moreBtnHtml = `<button class="more_btn small_btn"><img class="btn_icon btn_icon_margin" src="./images/image.svg" />Load more</button>`;
    $(".more_btn_wrapper").append(moreBtnHtml);
    $(".more_btn").click(function () {
      loadImages($(".search_bar").val(), splashID);
    });

    closeModal();
  };

  // when other w-imgr btn is pressed modal closes and removed, and new modal is created
  $(".splash_btn").click(function () {
    const currentBtn = $(this);
    if (activeModal) {
      closeModalLogic();
      setTimeout(function () {
        openModal(currentBtn);
      }, 800);
    } else {
      openModal(currentBtn);
    }
  });
});
