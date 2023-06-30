// ==UserScript==
// @name         Paginated Post Crawler
// @namespace    https://mikethai.xyz
// @version      1.0
// @description  Crawls paginated web pages and mines data from blog posts/articles.
// @match        https://*/*/episodes*
// @grant        none
// ==/UserScript==

( function () {
	'use strict';

	// ====================================================== //
	// ======================= Params ======================= //
	// ====================================================== //

	const unlimitedPagesEnabled = true;
	const maxPages = 60; // Max # of pages to crawl

	// ====================================================== //
	// ====================== Selectors ===================== //
	// ====================================================== //

	// 1) selectors for elements on the paginated results pages (that contains the links to the individual posts):
	const postLinkSelector = 'header > h3 > a';
	const nextPageSelector = 'ul.pagination > li:nth-of-type(n-1)';

	// 2) selectors for elements on within the individual post pages:
	const titleSelector = 'div.meta > h3';
	const contentSelector = 'section.post_content > p';

	// ====================================================== //
	// ====================== Variables ===================== //
	// ====================================================== //

	// current page number:
	let currentPageNo = 1;
	/* object of arrays containing the individual post URLs found on each paginated page of results.
	   expected schema:
		   {
				1: [ <url for pg1-post1>, <url for pg1-post2>, etc. ],
				2: [ <url for pg2-post1>, <url for pg2-post2>, etc. ],
		   }
	*/
	const postUrls = {};

	// final collection of extracted data to be exported to file:
	let data = [];

	// ====================================================== //
	// ====================== Functions ===================== //
	// ====================================================== //

	// Function to crawl all of the URLs on the current paginated post results page that match the `postLinkSelector` value
	function crawlCurrentResultsPage( pageNo ) {
		return new Promise( ( resolve ) => {
			const postLinks = Array.from( document.querySelectorAll( postLinkSelector ) );
			const postUrlsForPage = [];

			postLinks.forEach( ( link ) => {
				postUrlsForPage.push( link.href );
			} );

			postUrls[ pageNo ] = postUrlsForPage;

			const crawlPromises = postUrlsForPage.map( ( url ) => {
				return new Promise( ( resolvePost ) => {
					const xhr = new XMLHttpRequest();
					xhr.open( 'GET', url );
					xhr.onreadystatechange = function () {
						if ( xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 ) {
							const responseHTML = xhr.responseText;
							const parser = new DOMParser();
							const doc = parser.parseFromString( responseHTML, 'text/html' );

							const title = doc.title.trim();
							console.log(`🚀 title:`, title);
							const content = doc.querySelector( contentSelector ).textContent.trim();
							console.log(`🚀 content:`, content);

							data.push( { title, content } );

							resolvePost();
						}
					};
					xhr.send();
				} );
			} );

			Promise.all( crawlPromises ).then( () => {
				resolve();
			} );
		} );
	}

	// Function to navigate to the next page
	function goToNextPage( pageNo ) {
		const nextPageLink = document.querySelector( nextPageSelector );

		if ( nextPageLink ) {
			if ( unlimitedPagesEnabled ) {
				nextPageLink.click();
			} else if ( maxPages > 0 ) {
				maxPages--;
				nextPageLink.click();
			} else {
				endCrawl();
			}
		} else {
			endCrawl();
		}
	}

	// Function to export data to a CSV file
	function exportDataToCSV() {
		const csvContent = 'data:text/csv;charset=utf-8,' + data.map( obj => Object.values( obj ).join( ',' ) ).join( '\n' );
		const encodedUri = encodeURI( csvContent );
		const link = document.createElement( 'a' );
		link.setAttribute( 'href', encodedUri );
		link.setAttribute( 'download', 'data.csv' );
		document.body.appendChild( link );
		link.click();
	}

	// Function to export data to a JSON file
	function exportDataToJSON() {
		const jsonContent = JSON.stringify( data, null, 2 );
		const encodedUri = 'data:application/json;charset=utf-8,' + encodeURIComponent( jsonContent );
		const link = document.createElement( 'a' );
		link.setAttribute( 'href', encodedUri );
		link.setAttribute( 'download', 'data.json' );
		document.body.appendChild( link );
		link.click();
	}

	function endCrawl() {
		console.log( 'Crawling complete!' );
		exportDataToCSV();
		exportDataToJSON();
	}

	// Start the crawling process
	crawlCurrentResultsPage( currentPageNo ).then( () => {
		goToNextPage( currentPageNo + 1 );
	} );
} )();
