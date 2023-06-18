// ==UserScript==
// @name         Paginated Crawler
// @namespace    http://your-namespace.com
// @version      1.0
// @description  Crawls paginated web pages and mines data from blog posts/articles.
// @match        *://*/*/episodes/page-*/*
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
	const postLinkSelector = 'header > h3 > a',
		nextPageSelector = 'ul.pagination > li:nth-of-type(n-1)',

	// 2) selectors for elements on within the individual post pages:
		titleSelector = 'div.meta > h3',
		contentSelector = 'section.post_content > p';

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

	// Function to extract data from the current page
	function extractPostData() {
		const titles = Array.from( document.querySelectorAll( titleSelector ) ).map( element => element.textContent.trim() );
		const contents = Array.from( document.querySelectorAll( contentSelector ) ).map( element => element.textContent.trim() );

		// Combine the titles and contents into objects and add them to the data array
		titles.forEach( ( title, index ) => {
			data.push( { title, content: contents[ index ] } );
		} );
	}

	// Function to crawl all of the URLs on the current paginated post results page that match the `postLinkSelector` value
	function crawlCurrentResultsPage( pageNo ) {
		// 1. add current page's post URLs to `postUrls` object:
		// <insert code here>
		// 2. after `postURLs` has been updated, navigate to each of the new URLs, then `extractPostData() for that post`:
		// <insert code here>
	}

	// Function to navigate to the next page
	function goToNextPage() {
		const nextPageLink = document.querySelector( nextPageSelector );

		if ( nextPageLink ) {
			if ( unlimitedPagesEnabled ) {
				nextPageLink.click();
			} else if ( maxPages > 0 ) {
				maxPages--;
				nextPageLink.click();
			} else endCrawl();
		} else
			endCrawl();
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
		goToNextPage( currentPageNo + 1);
	} )
} )();