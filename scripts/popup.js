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
    //$("span#from_clip a").text(chrome.i18n.getMessage("popup_from_clip"));
    $("div#another_url a").text(chrome.i18n.getMessage("popup_another_url"));
    $("div#another_service a").text(chrome.i18n.getMessage("popup_another_service"));
    
    // populate service list
    $.each(services, function(id)
    {
        service = get_service(id);
        if (service.enabled)
        {
            doc.list.append("<li></li>").children().last().attr("name", id).click(function()
            {
                cur_service_id = $(this).attr("name");
                cur_service = get_service(cur_service_id);
                get_url();
            }).append('<img src="chrome://favicon/' + service.site + '">').append("<span></span>").children().last().text(service.name);
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
    
    $("div#sharers img").click(function()
    {
        chrome.tabs.create({ url: sharers[$(this).attr("name")].url.replace("%MSG%", $(this).data("url")) });
    });
    
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
    
    // fire it up
    if (get_config("use_default"))
    {
        cur_service_id = get_config(get_config("default_action") + "er");
        cur_service = get_service(cur_service_id);
        if (get_config("quick_mode"))
        {
            $("div#another_url, div#sharers, div#helpers").hide();
            $("div#main").show();
            chrome.tabs.getSelected(null, function(tab)
            {
                doc.input.val(tab.url);
                handle_url();
            });
        }
        else
        {
            get_url();
        }
    }
    else
    {
        pick_service();
    }
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

// dummy button handler function
function button_handler() {}

// hooked up to the button, calls the handler
function button_click()
{
    button_handler();
}

// shows the list of services, prompting the user to pick one
function pick_service()
{
    $("div#list").show();//slideDown();
    $("div#main").hide();//slideUp();
}

// shows the URL input
function get_url()
{
    ongoing_request = false;
    
    doc.input.css("background-color", "#FFF");
    if (!$("div#main:visible").size() > 0)
    {
        $("div#another_url, div#sharers").hide();
    }
    else
    {
        $("div#another_url, div#sharers").fadeOut();
    }
        
    doc.input.val("http://").attr("readonly", false);
    set_icon("chrome://favicon/" + cur_service.site);
    
    if (cur_service.categories.indexOf("expanding") >= 0)
    {
        doc.button.text(chrome.i18n.getMessage("popup_expand", cur_service.name));
    }
    else
    {
        doc.button.text(chrome.i18n.getMessage("popup_shorten", cur_service.name));
    }
    
    $("div#list").hide();//slideUp();
    $("div#main").show();//slideDown();
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
    set_icon("chrome://favicon/" + cur_service.site);
    doc.button.text(chrome.i18n.getMessage("popup_copy"));
    button_handler = copy;
    if (data.status)
    {
        $("div#sharers img").data("url", encodeURIComponent(data.msg));
        doc.sharers.fadeIn();
        doc.input.css("background-color", "#DCFFDC");
    }
    else
    {
        doc.input.css("background-color", "#FFDCDC");
    }
    
    // automatically copy
    if (get_config("clipboard"))
    {
        copy();
    }
}

// copy input to clipboard
function copy()
{
    chrome.extension.sendRequest({ request: "copy", data: doc.input.val() });
    doc.button.text(chrome.i18n.getMessage("popup_copied"));
}