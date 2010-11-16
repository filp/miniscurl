/*
 * popup.js
 * Miniscurl popup script
 *
 * Copyright (C) 2010 Håvard Pettersson.
 *
 * This software is distributed under the GPL Version 2 license.
 * See the attached LICENSE for more information.
 */

// global vars
var doc, cur_service, cur_service_id, ongoing_request, services, sharers;

// initialize
$(function()
{
    services = get_services();
    sharers = get_sharers();
    ongoing_request = false;
    doc =
    {
        list: $("ul"),
        input: $("input"),
        button: $("button"),
        sharers: $("div#sharers"),
    };
    
    // initialize labels etc from i18n
    $("div#listhelper").text(chrome.i18n.getMessage("popup_pick"));
    $("span#cur_tab a").text(chrome.i18n.getMessage("popup_cur_tab"));
    $("span#from_clip a").text(chrome.i18n.getMessage("popup_from_clip"));
    $("div#another_url a").text(chrome.i18n.getMessage("popup_another_url"));
    $("div#another_service a").text(chrome.i18n.getMessage("popup_another_service"));
    
    // populate service list
    $.each(services, function(id)
    {
        service = get_service(id);
        if (service.enabled)
        {
            doc.list.append("<li></li>").children().last().text(service.name).attr("name", id).click(function()
            {
                cur_service = get_service($(this).attr("name"));
                cur_service_id = $(this).attr("name");
                get_url();
            });
        }
    });
    
    // add sharing stuff
    $.each(sharers, function(id, service)
    {
        doc.sharers.append("<span>").children().last().addClass("sharer").append("<img>").children().last().attr("src", service.icon).attr("name", id);
    });
    
    // hitting enter in the URL input
    doc.input.keydown(function(event)
	{
		if (event.keyCode == 13) { doc.button.click(); }
	});
    
    // input helpers
	$("span#cur_tab a").click(function()
	{
		chrome.tabs.getSelected(null, function(tab) { doc.input.val(tab.url) });
	});
    
    // the button
    doc.button.click(button_click);
    
    // "Try another x"
    $("#another_service").click(pick_service);
    $("#another_url").click(get_url);
    
    // fixing padding etc for the favicons
    img = new Image();
	img.onload = function()
	{
		doc.input.css(
		{
			width: "270px",
			"padding-left" : "25px",
			backgroundImage: "url(" + img.src + ")",
		});
	}
    
    // misc stuff
    $("div#another_url").hide();
    
    // wait (nothing) before starting, to allow the popup to pop up first
    setTimeout(pick_service());
});

// setting the input icon and fixing padding etc
function set_icon(src)
{
	if (img.src != src)
	{ 
		doc.input.css(
		{
			width: "290px",
			"padding-left": "5px",
			backgroundImage: "none",
		});
		img.src = src;
	}
}

function button_handler() {}

function button_click()
{
    button_handler();
}

// shows the list of services, prompting the user to pick one
function pick_service()
{
    $("div#list").slideDown();
    $("div#main").slideUp();
}

// shows the URL input
function get_url()
{
    ongoing_request = false;
    
    doc.input.css("background-color", "#FFF");
    $("div#sharers").hide();
    if (!$("div#main:visible").size() > 0)
    {
        $("div#another_url").hide();
    }
    else
    {
        $("div#another_url").fadeOut();
    }
        
    doc.input.val("http://").attr("readonly", false);;
    
    set_icon(cur_service.site + "/favicon.ico");
    
    if (cur_service.categories.indexOf("expanding") >= 0)
    {
        doc.button.text(chrome.i18n.getMessage("popup_expand", cur_service.name));
    }
    else
    {
        doc.button.text(chrome.i18n.getMessage("popup_shorten", cur_service.name));
    }
    
    $("div#list").slideUp();
    $("div#main").slideDown();
    doc.input.select().focus();
    $("div#helpers").slideDown();
    button_handler = handle_url;
}

// loading gif and cancel button
function while_handling()
{
    ongoing_request = true;
	doc.input.attr("readonly", true);
    $("div#helpers").slideUp();
    set_icon(chrome.extension.getURL("img/loading.gif"));
    doc.button.text(chrome.i18n.getMessage("popup_cancel"));
    button_handler = get_url;
}

// do the shortening
function handle_url()
{
    while_handling();
    chrome.extension.sendRequest({ request: "shorten", service: cur_service_id, url: doc.input.val() }, function(response)
	{
		done(response);
	});
}

// handle the response
function done(data)
{
    if (!ongoing_request) { return; }
    $("div#another_url").fadeIn();
	doc.input.attr("readonly", true).val(data.msg);
    set_icon(cur_service.site + "/favicon.ico");
    doc.button.text(chrome.i18n.getMessage("popup_copy"));
    button_handler = copy;
    if (data.status)
    {
        $("div#sharers img").click(function()
        {
            chrome.tabs.create({ url: sharers[$(this).attr("name")].url.replace("%MSG%", data.msg) });
        });
        doc.sharers.slideDown();
        doc.input.css("background-color", "#DCFFDC");
    }
    else
    {
        doc.input.css("background-color", "#FFDCDC");
    }
}

// copy input to clipboard
function copy()
{
    chrome.extension.sendRequest({ request: "copy", data: doc.input.val() });
}