import styles from './index.css';
import loadIcon from './images/loader.svg';
import closeIcon from './images/x.svg';
import searchIcon from './images/search.svg';
import selectedIcon from './images/selected.svg';

// Load css styles
$('head').append(`<style>${styles.toString()}</style>`);

$(document).ready(function () {
	const proxy = 'https://w-imgr-proxy.herokuapp.com/';

	// state variable to watch active modal
	let activeModal = false;
	let activeSearch = false;
	let downloadURL = '';

	// index variable for updating Load More images
	let idIndex = -1;

	// get request needed to trigger image download counter MANDATORY for unsplash API usage
	const downloadTrigger = async function (url) {
		let downloadImage = await fetch(`${proxy}${url}`, {
			method: 'GET',
		});

		let res = await downloadImage.json();
	};

	const displayImages = function (res) {
		const imgArr = res.results;

		$('.w-imgr_image_container').css('display', 'inline-grid');

		console.log('res.results', res.results.length);
		// UX for when there are no more images to load
		if (res.results.length === 30) {
			$('.w-imgr_more_btn').children($('span')).text('Scroll voor meer');
			$('.w-imgr_image_container').css('height', '208px');
		} else if (res.results.length < 30 && res.total_pages !== 0) {
			console.log('less than 30');
			stopObserver();
			$('.w-imgr_image_container').css('height', '208px');
			$('.w-imgr_more_btn').children($('span')).text('Geen afbeeldingen meer');
		} else if (res.total_pages === 0) {
			console.log('no results');
			stopObserver();
			$('.w-imgr_more_btn_wrapper').addClass('w-imgr_more_btn_animation');
			$('.w-imgr_image_container').css('height', '0px');
			$('.w-imgr_more_btn')
				.children($('span'))
				.text('Geen afbeeldingen gevonden');
		}

		// index variable for updating index served into imgArr
		let index = -1;

		imgArr.forEach(() => {
			index++;
			idIndex++;
			const imgSrcSmall = imgArr[index].urls.small;
			const imgSrcFull = imgArr[index].urls.full;
			const imgSrcDownload = imgArr[index].links.download_location;

			const html = `
				<div class="w-imgr_image_wrapper">
					<div class="w-imgr_unsplash_image" id="w-imgr_unsplash-img-${idIndex}">
						<div class="w-imgr_unsplash_image_cover"></div>
						<div class="w-imgr_attribution_wrapper" id="w=imgr_attribution_wrapper-${idIndex}">
							<h5 class="w-imgr_creator_name">Photo by:  
								<a class="w-imgr_attribution_link" target="_blank" data="${imgSrcDownload}" href="${imgArr[index].user.links.html}?utm_source=w-imgr&utm_medium=referral" >${imgArr[index].user.name}</a>
							</h5>
							<h5 class="w-imgr_unsplash_link">
								<a class="w-imgr_attribution_link" href="https://unsplash.com?utm_source=w-imgr&utm_medium=referral" target="_blank">Unsplash</a>
							</h5>
						</div>
					</div>
				</div>
       			 `;

			/* $('.w-imgr_image_container').append(html); */
			$(html).insertBefore($('.w-imgr_image_container_observer'));

			startObserver();

			$(`#w-imgr_unsplash-img-${idIndex}`).css(
				'background-image',
				`url(${imgSrcSmall})`
			);
			$(`#w-imgr_unsplash-img-${idIndex}`).attr('data', `${imgSrcFull}`);
		});

		// when image is selected load in hd quality image from data attr as background-image
		$('.w-imgr_image_wrapper').click(function () {
			downloadURL = $(this).find($('.w-imgr_attribution_link')).attr('data');

			$('.w-imgr_close_modal_btn_wrapper').addClass(
				'w-imgr_close_modal_btn_animation'
			);
			const imageLink = $(this).children('.w-imgr_unsplash_image').attr('data');
			$('#w-imgr_form_input').val(imageLink);

			$('.w-imgr_image_wrapper_selected').removeClass(
				'w-imgr_image_wrapper_selected'
			);

			// Remove before creating new one
			$('.w-imgr_image_selected_icon').remove();

			// WHEN IMAGED SELECTED APPLY STUFF HERE
			$(this).addClass('w-imgr_image_wrapper_selected');
			$(this)
				.children('.w-imgr_unsplash_image')
				.append(
					`<img class='w-imgr_image_selected_icon' src="${selectedIcon}"/>`
				);

			(async () => {
				const img = new Image();
				img.src = `${imageLink}`;

				$(`#w-imgr_preview_image`).append(
					$('<div>')
						.addClass('w-imgr_loading_animation')
						.css('background-image', `url(${loadIcon})`)
				);

				await img.decode();
				$('.w-imgr_loading_animation').remove();
				$('.w-imgr_loading_text').remove();
				$(`#w-imgr_preview_image`).css('background-image', `url(${imageLink}`);
			})();
			$('#w-imgr_remove_btn').css('display', 'block');
		});

		index = -1;
	};

	// Intersection observer for inside image container - show load btn or not
	const observerCallback = function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				$('.w-imgr_more_btn_wrapper').addClass('w-imgr_more_btn_animation');
				$('.w-imgr_more_btn').children($('span')).text('Aan het laden...');
				loadImages($('.w-imgr_search_bar').val());
			} else if (!entry.isIntersecting) {
				$('.w-imgr_more_btn_wrapper').addClass('w-imgr_more_btn_animation');
				$('.w-imgr_more_btn').children($('span')).text('Scroll voor meer');
			}
		});
	};

	let observer = new IntersectionObserver(observerCallback, {
		root: document.querySelector('.w-imgr_image_container'),
		rootMargin: '200%',
		threshold: 0.1,
	});

	const startObserver = function () {
		const target = document.querySelector('.w-imgr_image_container_observer');
		observer.observe(target);
	};

	const stopObserver = function () {
		const target = document.querySelector('.w-imgr_image_container_observer');
		observer.unobserve(target);
	};

	// Loading animation for API call getting + loading images
	const displayLoading = function () {
		const html = `<div class="w-imgr_api_loader"></div>`;
		//$(html).insertBefore('.w-imgr_more_btn');
		$(html).insertBefore('.w-imgr_more_btn_wrapper');
	};

	const hideLoading = function () {
		$('.w-imgr_api_loader').remove();
	};

	let pageNumber = 1;
	// Get images on search query
	const loadImages = async function (query) {
		console.log('pagenumber', pageNumber);

		displayLoading();

		let getImages = await fetch(
			`${proxy}https://api.unsplash.com/search/photos?&orientation=landscape&page=${pageNumber}&per_page=30&query=${query}>`,
			{
				method: 'GET',
				headers: { query: query, page: pageNumber },
			}
		);

		let res = await getImages.json();
		console.log('response', res);

		hideLoading();

		displayImages(res);
		console.log('images amount: ', $('.w-imgr_unsplash_image').length);
		pageNumber++;
	};

	// closing the modal
	const closeModalLogic = function () {
		pageNumber = 1;

		// Trigger unsplash 'download'
		if (downloadURL) {
			downloadTrigger(downloadURL);
		}

		$('.w-imgr_more_btn').css('display', 'none');
		$('.w-imgr_modal_wrapper').removeClass('w-imgr_modal_animation');
		$('.w-imgr_modal_wrapper').addClass('w-imgr_modal_animation_remove');
		//activeModal = false;
		setTimeout(function () {
			$('.w-imgr_image_container').css('display', 'none');
			$('.w-imgr_modal_wrapper').css('display', 'none');
			$('.w-imgr_modal_wrapper').removeClass('w-imgr_modal_animation_remove');
			$('.w-imgr_search_bar').val('');
			$('.w-imgr_modal_backdrop').css('display', 'none');
			$('.w-imgr_image_container').remove();
		}, 500);
	};

	// To attach to close btn on creation of modal
	const closeModal = function () {
		stopObserver();
		$('.w-imgr_close_modal_btn_wrapper').click(function () {
			$('.w-imgr_close_modal_btn_wrapper').removeClass(
				'w-imgr_close_modal_btn_animation'
			);
			$('body').css('overflow', 'auto');
			closeModalLogic();
		});
		$('body').click(function (e) {
			if (e.target === $('.w-imgr_modal_backdrop')[0]) {
				$('body').css('overflow', 'auto');
				closeModalLogic();
			}
		});
	};

	const openModal = function (btn) {
		activeModal = true;
		const modal = `
    <div class="w-imgr_modal_backdrop">
      <div class="w-imgr_modal_wrapper w-imgr_modal_animation">
        <div class="w-imgr_modal_header_wrapper">
		<div class="w-imgr_modal_header_filler"></div>
          <div class="w-imgr_heading_wrapper">
            <h3 class="w-imgr_heading_title">Zoek voor een afbeelding</h3>
          </div>
          <div class="w-imgr_modal_controls_wrapper">
            <div class="w-imgr_close_modal_btn_wrapper">
			  <img class="w-imgr_close_modal_btn" src="${closeIcon}">
            </div>
          </div>
        </div>

		<div class="w-imgr_form_wrapper">
			<form id="w-imgr_form-image-search">
				<div class="w-imgr_search_bar_wrapper">
							<img class="w-imgr_search_icon" src="${searchIcon}" />
					<input
						class="w-imgr_search_bar"
						type="text"
						inputmode="search"
						placeholder="bijv. 'Neighbourhood'"
						background="url(${searchIcon})"
					/>
				</div>
			</form>

			<div class="w-imgr_suggestion_container">
				<div class="w-imgr_suggestions_wrapper">
					<span class="w-imgr_suggestion_text_title">Andere suggesties:</span>
					<span class="w-imgr_suggestion_text">Buildings</span>
					<span class="w-imgr_suggestion_text">Homes</span>
					<span class="w-imgr_suggestion_text">Real estate</span>
				</div>
			</div>
		</div>

        <div class="w-imgr_image_container">
			<div class="w-imgr_image_container_observer"></div>
		</div>
		<div class="w-imgr_loader_more_wrapper">
			<div class="w-imgr_more_btn_wrapper"></div>
		</div>	
      </div>
    </div>
      `;
		$('body').append(modal);
		$('body').css('overflow', 'hidden');
		$('.w-imgr_search_bar').focus();
		$('#w-imgr_form-image-search').submit(function (e) {
			e.preventDefault();
			if (!activeSearch) {
				activeSearch = true;
				loadImages($('.w-imgr_search_bar').val());
				$('.w-imgr_more_btn').css('display', 'flex');
			} else if (activeSearch) {
				pageNumber = 1;
				$('.w-imgr_image_container').find($('.w-imgr_image_wrapper')).remove();
				loadImages($('.w-imgr_search_bar').val());
				$('.w-imgr_more_btn').css('display', 'flex');
			}
		});

		$('.w-imgr_suggestion_text').click(function () {
			if (!activeSearch) {
				activeSearch = true;
				$('.w-imgr_more_btn').children($('span')).text('Aan het laden...');
				$('.w-imgr_search_bar').val($(this).text());
				loadImages($('.w-imgr_search_bar').val());
				$('.w-imgr_more_btn').css('display', 'flex');
			} else if (activeSearch) {
				pageNumber = 1;
				$('.w-imgr_more_btn').children($('span')).text('Aan het laden...');
				$('.w-imgr_image_container').find($('.w-imgr_image_wrapper')).remove();
				$('.w-imgr_search_bar').val($(this).text());
				loadImages($('.w-imgr_search_bar').val());
				$('.w-imgr_more_btn').css('display', 'flex');
			}
		});

		const moreBtnHtml = `<button class="w-imgr_more_btn"><span class="w-imgr_more_btn_text">Scroll voor meer</span></button>`;
		$('.w-imgr_more_btn_wrapper').append(moreBtnHtml);

		closeModal();
	};

	const createImgContainer = function () {
		const imageContainer = `
		<div class="w-imgr_image_container">
			<div class="w-imgr_image_container_observer"></div>	
		</div>`;
		$(imageContainer).insertAfter('.w-imgr_form_wrapper');
	};

	const reOpenModal = function () {
		$('.w-imgr_modal_wrapper').css('display', 'flex');
		$('.w-imgr_modal_wrapper').addClass('w-imgr_modal_animation');
		createImgContainer();
		$('body').css('overflow', 'hidden');
		$('.w-imgr_modal_backdrop').css('display', 'flex');
		$('.w-imgr_search_bar').focus();
	};

	$('#w-imgr_start_btn').click(function () {
		if (!activeModal) {
			openModal();
		} else if (activeModal) {
			reOpenModal();
		}
	});

	$('#w-imgr_remove_btn').click(function () {
		$('#w-imgr_form_input').val('');
		$('#w-imgr_preview_image').css('background-image', '');
		$(this).css('display', 'none');
	});
});

// QUERY ERROR => on results === 0 => show error message and prevent image_container from growing => stay same height
